import GetData from 'meteor/study:form-widget';
import UtilsData from 'meteor/chotot:platform-ui/base/utils/data';

const sError = require('./schema-error')

SchemaIns = []
class Schema {
  constructor(name, data, opt = {}){
    this._name = name
    this._tpl = Template.instance();
    //TODO: need optimize schema only handle schema config.
    this._config = opt.config || BaseTemplate.of()._config;
    this._pings = {}
    this._id = SchemaIns.length;
    this._items = [];

    this._error = new sError()

    SchemaIns.push(this)
    dsLog.debug(`load schema ${this._id}`)
    //METHOD
    if (this._config.methods && this._config.methods[name]) {
      this._method = BaseMethod.of(BaseTemplate.of()._name+'/'+name);
      this.post = this._method.post.bind(this._method);
    }
    //DATA
    this.initData(data);
    //SCHEMA
    this._schema = {}
    this._schema_for = {}
    this._revert_schema = {}
    this.getSchema(opt);
    
    //EVENT CUSTOMIZE

    //INS
    if (!Schema.pingAdd) {
      Schema.pingAdd = new ReactiveVar(0)
    }
    Schema.pingAdd.set(Schema.pingAdd.get()+1);
    return this
  }
  destroy(){
    //remove all input
    InputSchema.destroyBySchema(this._id);
    SchemaIns[this._id] = null;
  }
  static count(){
    if (!Schema.pingAdd) {
      Schema.pingAdd = new ReactiveVar(0)
    }
    Schema.pingAdd.get()
    return  SchemaIns.filter((i)=>{return i}).length;
  }
  static of(schema_id, data, opt) {
    if (schema_id || schema_id === 0)
      return SchemaIns[schema_id];
    if (schema_id == -1) {
      return new Schema(BaseTemplate.of()._name, data, opt);
    }
    return BaseSchema.getIns()
  }
  static getIns() {
    for (let i = 0; i < 50; i++) {
      let data = Template.parentData(i);
      if (data && (data.schema_id || data.schema_id === 0))
        return SchemaIns[data.schema_id];
    }
    for (let ins of SchemaIns) {
      if (ins)
        return ins
    }
    return null;
  }
  clone(data, opt) {
    return new Schema(this._name, data);
  }
  //base config
  isDisabled(head) {
    //ALL
    if (!head.input || head.input.enable === false)
      return true;
    //TYPE
    let data = this._data.get();
    if (!data || !UtilsData.getId(data))
      return head.input.isAdd === false;
    return head.input.isEdit === false;
  }
  getCfgHeads(opt = {}) {
    return opt.heads || this._config.heads
  }
  getCfgSchema(opt = {}) {
    return opt.schema || this._config.schema
  }
  getSchema(opt) {
    let cfgHeads = this.getCfgHeads(opt)
    if (cfgHeads) {
      let heads = []
      for (let head of cfgHeads) {
        if (this.isDisabled(head))
          continue;
        this.setCfg(head.key, head)
        heads.push(head);
      }
      this._heads = heads;
    }
    let cfgSchema = this.getCfgSchema(opt)
    if (cfgSchema) {
      for (let key in cfgSchema) {
        this.setCfg(key, cfgSchema[key])
      }
    }
  }
  //heads
  heads() {
    //Heads always are static array of head
    //Schema can be changed by ref function from a head/schema in Heads
    return this._heads
  }
  //Configuration in schema
  for(name) {
    return this._schema_for[name]
  }
  cfg(name) {
    return this._schema[name];
  }
  setCfg(name, cfg) {
    let nameSplit  = name.split('.');
    if (nameSplit.length >1) {
      let last = nameSplit.pop()
      let first = nameSplit.join('.');
      if (!this._schema_for[first])
        this._schema_for[first] = []
      this._schema_for[first].push(name)
    }
    if (this._revert_schema[cfg.key])
      console.warn(`dup config key in schema at ${name} vs ${this._revert_schema[cfg.key]}`)
    this._revert_schema[cfg.key] = name;
    this._schema[name] = _.extend({}, cfg);
  }
  addCfg(name, cfg) {
    //IS it be replace
    if (this.cfg(name))
      return
    this.setCfg(name, cfg);
  }
  //add to current schema for schema config
  add(name) {
    this.addCfg(name, this.cfg(name))
  }
  //scale cfgs out of schema config
  scale(cfgs) {
    for (let cfg of cfgs) {
      this.addCfg(cfg._key || cfg.key, cfg)
    }
  }

  //DATA Function for the Schema
  initData(data){
    let self = this;
    self._data = new ReactiveVar(null);
    this._tpl.autorun(function(){
      dsLog.debug(`init Data in schema ${self._id}`)
      let _data = data && (typeof data.get == 'function' && data.get()) || data ;
      if (!_data)
        return
      self._config.initData && self._config.initData.call(self, _data)
      self._data.set(_data);
    })

  }
  setData(data) {
    dsLog.debug(`setData from schema ${this._id} `, data)
    return this._data.set(data)
  }
  getData() {
    dsLog.debug(`getData from schema ${this._id}`)
    return this._data.get() || {};
  }

  //End Value
  getLastData() {
    let err = this._error.get('validate');
    if (err) {
      dsLog.error(err);
      throw new Error(err);
    }
    let data = GetData.inForm(this._tpl, {schema_id: this._id});
    //CLEAN DATA;
    for (let key in data) {
      try {
        let schema_key = this._revert_schema[key];
        let schema = this._schema[schema_key] || this._schema[key];
        if (!schema)
          continue;
        let clean = schema.clean;
        if (typeof clean != "function") {
          continue;
        }
        data[key] = clean.call(this, key, data[key], data);
      } catch (e) {
        console.error(e);
      }
    }
    return data;
  }
  getChangedData(map){
    let data = map && map(this._data.get()) || this._data.get();
    return GetData.checkDataChange(data, this.getLastData());
  }

  //VALIDATE, NEED UPDATE
  validate(data){
    let heads = this.get();
    let headMaps = this.getMap();

    for (let key in data) {
      let value = data[key];
      let input = heads[headMaps[key]] && heads[headMaps[key]].input;
      if (!input) continue;
      if (typeof input.validate == 'function') {
        let validate = input.validate(value, {input: input, data: data});
        if (validate) {
          Session.set('isLoadingScreen', false);
          return validate;
        }
      }
    }
  }
  get(ping){
    if (!this._pings[ping])
      this._pings[ping] = new ReactiveVar();
    return this._pings[ping].get();
  }
  set(ping, value){
    if (!this._pings[ping])
      this._pings[ping] = new ReactiveVar();
    this._pings[ping].set(value);
  }
  ready({events}) {
    this.events(events);
  }
  events(events, tpl) {
    if (!events)
      return;
    const self = this;
    for (let selector in events) {
      for (let type in events[selector]) {
        /* jshint ignore:start */
        // because init very small list functions
        this._tpl.$('.schema-bound').on(type, selector, function(e) { 
          events[selector][type].call(self, e, tpl);
        });
        /* jshint ignore:end */
      }
    }
  }
  pingAll() {
    for (let item of this._items) {
      item.currentPing();
    }
  }
}
BaseSchema = Schema;
module.exports = Schema;