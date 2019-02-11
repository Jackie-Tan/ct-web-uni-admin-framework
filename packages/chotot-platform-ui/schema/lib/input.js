import GetData from  'meteor/study:form-widget'
import InputScript  from 'meteor/chotot:common/func/input-script.js';
var InputIns = {};
var simpleInput = {
  get: function () {
    return null
  },
  watching: function() {
    return null
  }
}
const DEFAULT_VALUE = {
  'OJSON': {},
  'OARRAY': [],
  'JSON': {},
  'ARRAY': [],
}
class Input {
  constructor(schema_id, key, tpl, opt = {}){
    this._opt = opt;
    this._context = Template.parentData();
    this._tpl = tpl;
    this._key = key
    this._schema_id = schema_id;
    this._schema = BaseSchema.of(schema_id)
    this._orig = {}
    this._watch_list = {}
    this._depend = [];
    this._ref = {};
    this._oConfig = this._schema.cfg(this._key) || {};
    if (!this._oConfig) {
      console.error("miss config at ", arguments)
    }
    this._input = this._oConfig.input || {};
    this._type =  this._input.subtype || this._input.type || "string";
    this._kind =  (this._input.kind || (this._input.type  || "string").split(".")[0]).toUpperCase();

    this._hide = new ReactiveVar(this._input.hide === true);
    this._enable = new ReactiveVar(this._input.enable !== false)
    this._rootClass = new ReactiveVar('');
    dsLog.debug(`create input for schema ${schema_id} key ${key}`)

    //BOOL
    this._isFirstChange = new ReactiveVar()
    //computation
    this._com = {};
    this.genId();


    this._value = new ReactiveVar(null)
    this._display = new ReactiveVar(null)
    //seperate 2 reactive listen for view and input
    let self = this;
    this.autorun(function () {
      dsLog.debug(`init schema ${self._schema_id} key ${self._key}`)
      self.initOrig('value', function () {self.initConfig()})
    })
      this.initConfig()
    this.autorun(function () {
      self.initOrig('display');
    })
    this.currentPing(function(){
      self.initEl()
    })
    this.autorun('pong', function () {
        self.pong()
    })
  
    // this.autorun(function () {
    //   if (!self._isFirstChange.get())
    //     return
    //   self.validate();
    // })
    this._schema.set(`input_${schema_id}_${key}_loaded`, true)

    let rootClass = self._input.rootClass
    if (typeof rootClass == 'function') {
      this.autorun(function() {
        rootClass.call(self, (cls) => {
          self._rootClass.set(cls)
        })
      })
    }
    this.readyPing() 
  }
  static destroyBySchema(schema_id) {
    for (let key in InputIns[schema_id]) {
      InputIns[schema_id][key].destroy();
      delete InputIns[schema_id][key]
    }
    delete InputIns[schema_id]
  }
  destroy() {
    try {
      let {schema_id, key} = this._id;
      this._schema.set(`input_${schema_id}_${key}_loaded`);
      if (InputIns[schema_id]) 
        delete InputIns[schema_id][key]
      for (let key in this._com) {
        this._com[key].stop()
      }
    } catch(e) {
      console.error(e);
    }
  }
  static key(schema_id) {
    return InputIns[schema_id]
  }
  static load(schema_id, key) {
    try {
      return InputIns[schema_id][key]
    } catch (e) {
      return null;
    }
  }
  another(key) {
    let {schema_id, oKey} = this._id
    if (!this._schema.get(`input_${schema_id}_${key}_loaded`)) {
      return simpleInput
    }
    let input = Input.load(schema_id, key);
    input._ref[oKey] = true;
    return input;
  }
  static find(key) {
    let input = null;
    for (let i = 0; i < 30; i++) {
      let data = Template.parentData(i) || {}
      let nextData = data.data || {};
      let input_id = data.input_id || nextData.input_id || {}
      let {schema_id} = _.extend({}, data, nextData, input_id)
      if (schema_id || schema_id === 0){
        input = Input.load(schema_id, key)
        break
      }
    }
    if (!input) {
      dsLog.debug('find not found', Template.parentData(0))
      return simpleInput;
    }
    return input
  }
  static of(componentKey) {
    if (componentKey) {
      return Input.load(BaseSchema.of()._id, componentKey)
    }
    for (let i = 0; i < 30; i++) {
      let data = Template.parentData(i)
      let input_id = data && (data.input_id || (data.data && data.data.input_id))
      if (input_id) {
        let {schema_id, key} = input_id
        return Input.load(schema_id, key)
      }
    }
    dsLog.debug('of not found', Template.parentData(0))
    return null;
  }
  genId() {
    if (!InputIns[this._schema_id])
      InputIns[this._schema_id] = {}
    if (!InputIns[this._schema_id][this._key])
      InputIns[this._schema_id][this._key] = []
    this._id =  {schema_id: this._schema_id, key: this._key}
    InputIns[this._schema_id][this._key] = this
    this.exportId()
    this.initDepend();
  }
  exportId() {
    Template.parentData(0).input_id = this._id;
    dsLog.debug(`export schema ${this._schema_id} key ${this._key}`, Template.parentData(0))
  }
  getData() {
    return this._opt.data || this._schema.getData()
  }
  initOrig(type, next) {
    let schemaData =  this.getData();
    let self = this;
    //DEFAULT get from schemaData
    this._orig[type] = schemaData[this._key];
    //Mapping value
    let valueFunc = this._input[type];
    if (typeof valueFunc == "function") {
      try {
        valueFunc.call(self, schemaData, function (resp) {
          if (type == 'value' && self._type == 'number')
            resp = parseInt(resp)
          self._orig[type] = resp;
          self[`_${type}`].set(self._orig[type])
          if (next) {
            next()
          }
        })
      } catch (e) {
        console.warn(`Init Origin Value Of ${type} in key ${self._key}`, e)
        self._orig[type] = null;
        self[`_${type}`].set(null)
      }
      return
    }
    self[`_${type}`].set(self._orig[type])
  }
  getTemplate() {
    let type = this._input.type
    if (type) {
      let template = type + 'Input';
      if (Template[template]) {
        return template
      }
    }
    return 'defaultInput'
  }
  initConfig(){
    this._oConfig.template = this.getTemplate()
    let value = this._orig.value;
    if (typeof value == 'undefined' && typeof this._oConfig.autoValue != 'undefined') {
      let newValue = typeof this._oConfig.autoValue == 'function'?this._oConfig.autoValue():this._oConfig.autoValue
      if (typeof newValue != 'undefined') {
        value = newValue
        this._value.set(newValue)
      }
    }
    this._oConfig.value = value
    if (!this._config)
      this._config = new ReactiveVar(this._oConfig)
    else
      this._config.set(this._oConfig)
  }
  parent() {
    for (let i = 1; i < 10; i++) {
      let data = Template.parentData(i)
      let input_id = data && (data.input_id || (data.data && data.data.input_id))
      if (input_id) {
        let {schema_id, key} = input_id
        return Input.load(schema_id, key)
      }
    }
  }
  initDepend(){
    let input = this.parent()
    if (input) {
      this._parent = input
      if (input._key == this._key) {
        return;
      }
      input._depend.push(this._id)
    }
  }
  //properties
  //type is static for a key
  // Get Data Helpers

  getHelpers() {
    return this._config.get()
  }

  //get Value
  view(){
    return this._display.get() || this._value.get()
  }
  getJSON() {
    return {}
  }

  getARRAY(){
    return []
  }
  getInTemplate() {
    return (this._el && (GetData.inForm(this._tpl) || {})[this._oConfig.key]) || null;
  }
  getSPACEBAR(){
    return this.getInTemplate()
  }
  curr() {
    return this._value.curValue
  }
  get() {
    let value = this._value.get()
    if (typeof value == 'undefined') {
      return DEFAULT_VALUE[this._kind];
    }
    return value
  }
  //set Value
  change(e) {
    //FormatValue
    this._isFirstChange.set(true)
    this.setByEl($(e.currentTarget))
  }
  setEL(value) {
    let self = this;
    if (!self._el)
      return;
    if (['radio', 'checkbox'].indexOf(self._el.attr('type')) != -1) {
      self._el.each(function(){
        if (this.value == value)
          this.checked = true;
      })
      return
    }
    self._el.val(value)
  }
  setByEl(el) {
    //waiting for font-end action
    let self = this;
    this.currentPing(function () {
      el = el || self._el;
      if (!el)
        return
      if (self._kind == "OJSON" || self._kind == "OARRAY") {
        self.set(self.getInTemplate())
        return
      } 
      let formatFunc = FormatType[self._type] || FormatType.default;
      formatFunc.call(self, el, function (value) {
        dsLog.debug(`schema ${self._schema_id}set value for ${JSON.stringify(self._id)} type ${self._type} value ${value}`)
        self.set(value)
      })
    })
    this.refNotify();
  }
  refNotify(){
    let self = this;
    this.currentPing(function(){
      for (let key in self._ref) {
        //because the change will be affect to value of inputs that ref to
        let input = Input.load(self._schema_id, key)
        input && input.setByEl()
      }
    })
  }
  forceSet(newValue){
    let self= this
    this.currentPing(function(){
      self.setEL(newValue);
      self.set(newValue);
      self.refNotify();
    })
    
  }
  set(newValue) {
    this._value.set(newValue)
    //Change display
  }
  //Validate for chaging value in the input
  validate(value) {
    if (typeof this._input.validate != 'function') {
      return;
    }
    let self = this;
    let msg = self._input.validate.call(self, value)
    if (msg) {
      dsLog.error(msg)
      return self._schema._error.set(`validate.${self._key}`,msg)
    }
    self._schema._error.remove(`validate.${self._key}`)


  }

  initEl(){
    if (this._el)
      return;
    //for render
    let self = this;
    this._elbound = this._tpl.$(this._tpl.$(`.input-bound`)[0])
    if (this._kind == "OJSON" || this._kind == "OARRAY") {
      this._el = this._elbound
      console.log(`${self._key} ${self._kind} change`);
      this._elbound.on('change', '[data-name]', function(e) {
        console.log(`${self._kind} change`);
        self.change(e)
      })
      return
    }
    this._el = this._tpl.$(`[data-name="${this._oConfig.key}"]`)
    this._elbound.on('change', `[data-name="${this._oConfig.key}"]`, function(e) {
      self.change(e)
    })
  }
  currentPing(pingFunc) {
    let currentView = this._tpl.view;
    if (typeof pingFunc == 'undefined')
      pingFunc = this.ping;
    let self = this;
    let fire = function(){
      if (currentView._domrange.attached) {
        return pingFunc.call(self)
      }
      currentView._domrange.onAttached(function(){
        pingFunc.call(self)
      })
    }
    if (currentView.isRendered)
      return fire()
    return currentView._onViewRendered(function(){
      fire()
    })
  }
  readyPing() {
    let schemaView = this._schema._tpl.view;
    this._schema._items.push(this);
    let self = this;
    let bigFire = function() {
      if (schemaView._domrange.attached) {
        //SchemaView is Rendenred
        self.currentPing()
      }
      schemaView._domrange.onAttached(function(){
        self._schema.pingAll();
      });
    }
    if (schemaView.isRendered)
      return bigFire()
    return schemaView._onViewRendered(function(){
      bigFire()
    })
  }
  ping() {
    if (this._isPing) 
      return
    this._isPing = true;
    //init value
    let events = this._config.get().events;
    let self = this;
    if (events && events.length) {
      for (let event of events){
        if (event == 'change')
          continue;
        self._el.on(event, function (e) {
          self.change(e)
        })
      }
    }
    let onEvents = this._config.get().onInput || {}
    for (let event in onEvents) {
      for (let selector in onEvents[event])
        this._elbound.on(event, selector, function (e) {
          onEvents[event][selector].call(self, e)
        })
    }
  }
  // hide and show an input
  pong() {
    return this._input.pong && this._input.pong.call(this)
  }
  put(key, value) {
    if (!this._watch_list[key])
      return this._watch_list[key] = new ReactiveVar(value);
      this._watch_list[key].set(value);
  }
  watching(key) {
    if (!this._watch_list[key])
      this._watch_list[key] = new ReactiveVar()
    return this._watch_list[key].get();
  }
  
  // class manage
  isFirstChange() {
    return this._isFirstChange.get()
  }
  getRootClass() {
    return this._rootClass.get()
  }
  //action to css
  hide() {
    this._hide.set(true)
  }
  show() {
    this._hide.set(false)
  }
  //remove an input
  enable() {
    this._enable.set(true)
  }
  disable() {
    this._enable.set(false)
  }
  isEnable() {
    return this._enable.get()
  }
  //autorun use for seperate a  big autorun to smaller
  // and make sure reactive its value will be not affect to parent autorun
  autorun(name, func){
    if (typeof name == 'function') {
      func = name;
      name = "null";
    }
    let self = this;
    Tracker.nonreactive(function () {
      let com = Tracker.autorun(func)
      if (name) {
        return self._com[name] = com
      }
    })
  }
  //action-span
  prop(property, value) {
    let self = this;
    this.currentPing(function(){
      self._el.prop(property, value)
    })
  }
  //span action
  do(script, data) {
    let list = script.split(',');
    let tpl = this._tpl;
    let self = this
    list.map(function (item) {
      let input = item.split(':');
      let name = input[0];
      let action = input[1];
      //TODO: change inputEL -> InputSchema
      InputScript.call(self, {
        name: name,
        data: data,
        action: action
      })
    })
    return this;
  }
}
InputSchema = Input;
module.exports = Input;