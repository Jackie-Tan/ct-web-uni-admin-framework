import InputSchema from './input'
var ViewIns = {}
var simpleInput = {
  get: function () {
    return null
  }
}
class viewSchema {
  constructor(schema_id, key, tpl, opt) {
    this._tpl = tpl
    this._key = key
    this._schema_id = schema_id;
    this._schema = BaseSchema.of(schema_id)
    this._oConfig = this._schema.cfg(this._key) || {};
    this._input = this._oConfig.input || {};
    this._type =  this._input.subtype || this._input.type || "string";
    this._orig = {}
    this._show = new ReactiveVar(this._oConfig.isVisible !== false)
    this._value = new ReactiveVar()
    this._display = new ReactiveVar()
    this._style = new ReactiveVar('');
    this._rootClass = new ReactiveVar('');
    this._opt = opt || {
        data: null, //for inject data
      }
    this.genId();
    let self = this;

    self.comp = self._tpl.autorun(function () {
      self._schema.get(`input_${self._schema_id}_${self._key}_loaded`)
      if (InputSchema.load(self._schema_id, self._key)) {
        return setTimeout(function () {
          self.comp.stop()
        }, 0)
      }
      self.initOrig("value")
      self.initOrig("display")
    })
    self._tpl.autorun(function () {
      self.pong()
    })
    let styleFunc = self._input.style
    if (typeof styleFunc  == 'function') {
      this._tpl.autorun(function() {
        styleFunc.call(self, (newStyle) => {
          self._style.set(newStyle)
        })
      })
    }
    let rootClass = self._input.rootClass
    if (typeof rootClass == 'function') {
      this._tpl.autorun(function() {
        rootClass.call(self, (cls) => {
          self._rootClass.set(cls)
        })
      })
    }
    this.readyPing()
  }
  genId(){
    if (!ViewIns[this._schema_id])
      ViewIns[this._schema_id] = {}
    if (!ViewIns[this._schema_id][this._key])
      ViewIns[this._schema_id][this._key] = []
    this._id =  {schema_id: this._schema_id, key: this._key}
    ViewIns[this._schema_id][this._key].push(this)
    this.exportId();
  }
  initOrig(type) {
    let schemaData = this._opt.data || this._schema.getData()
    let self = this;
    //DEFAULT get from schemaData
    this._orig[type] = schemaData[this._key];
    //Mapping value
    let valueFunc = this._input[type];
    if (typeof valueFunc == "function") {
      try {
        valueFunc.call(self, schemaData, function (resp) {
          self._orig[type] = resp;
          self[`_${type}`].set(self._orig[type])
        })
      } catch (e) {
        console.error(`wrong config in key: ${this._key}`, e)
        self._orig[type] = null;
        self[`_${type}`].set(null)
      }
      return
    }
    self[`_${type}`].set(self._orig[type])
  }
  another(key) {
    let {schema_id, oKey} = this._id
    if (!BaseSchema.of(schema_id).get(`input_${schema_id}_${key}_loaded`)) {
      return simpleInput
    }
    let input = InputSchema.load(schema_id, key);
    input._ref[oKey] = true;
    return input;
  }
  exportId() {
    Template.parentData(0).input_id = this._id;
    dsLog.debug(`export schema ${this._schema_id} key ${this._key}`, Template.parentData(0))
  }
  static of(schema_id, key, tpl, opt) {
    dsLog.debug(`create view for schema ${schema_id} key ${key}`)
    return new viewSchema(schema_id, key, tpl, opt)
  }
  static load(schema_id, key) {
    return ViewIns[schema_id] && ViewIns[schema_id][key]
  }
  static key(schema_id) {
    return ViewIns[schema_id]
  }
  destroy() {
    let {schema_id, key} = this._id;
    if (ViewIns[schema_id])
      delete ViewIns[schema_id][key]
  }
  get() {
    this._schema.get(`input_${this._schema_id}_${this._key}_loaded`)
    let input = InputSchema.load(this._schema_id, this._key)
    if (input)
      return input.view()
    return this._display.get() || this._value.get()
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
    //init internal event
    let self = this;
    let onEvents = this._oConfig.onView || {}
    for (let event in onEvents) {
      for (let selector in onEvents[event])
        this._tpl.$(`.view-bound`).on(event, selector, function (e) {
          onEvents[event][selector].call(self, e)
        })
    }
  }
  pong() {
    return this._input.pongView && this._input.pongView.call(this)
  }

  //autorun use for seperate a  big autorun to smaller
  // and make sure reactive its value will be not affect to parent autorun
  autorun(func){
    let self = this;
    Tracker.nonreactive(function () {
      self._tpl.autorun(func)
    })
  }
  hide() {
    this._show.set(false);
  }
  show() {
    this._show.set(true)
  }
  isShow() {
    return this._show.get()
  }
  //class
  getDisplayClass() {
    //displayClass is static by key
    let cls = [this._input && this._input.displayClass || "form-group col-md-12"];
    return cls.join(" ")
  }
  getBoundClass() {
    //boundClass is static by key
    let cls = [this._input && this._input.boundClass || ""];
    if (this._input.action) {
      cls.push("input-group")
    }
    return cls.join(" ")
  }
  getRootClass() {
    return this._rootClass.get()
  }
  getStyle() {
    return this._style.get();
  }
}


ViewSchema = viewSchema
module.exports = ViewSchema;