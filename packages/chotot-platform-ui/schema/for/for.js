Template.forSchema.onCreated(function () {
  this._schema = BaseSchema.of()
  this._opt_orig =  this.data && this.data.opt || {data: this._schema.getData()}
  this._opt = new ReactiveVar(this._opt_orig)
  let root = this._schema.cfg(this.data.key)
  if (root && typeof root.initData == 'function' && this._opt_orig && this._opt_orig.data) {
    let self = this;
    let newOpt =_.cloneDeep(this._opt_orig)
    root.initData(newOpt.data, function (newData) {
      newOpt.data = newData
      self._opt.set(newOpt)
    })
  }
})
Template.forSchema.helpers({
  'schemas': function () {
    return Template.instance()._schema.for(this.key)
  },
  'opt': function () {
    return Template.instance()._opt.get();
  },
  'config': function () {
    return Template.instance()._schema.cfg(""+this)
  }
})

Template.forInForSchema.onCreated(function(){
  this._schema = BaseSchema.of();
  
})
Template.forInForSchema.helpers({
  'config': function() {
    const 
    CURRENT_CONFIG = this.config,
    INFORSCHEMA_CONFIG = Template.instance()._schema._schema[this.key],
    DEFAULT_CONFIG = {isLoop: true};
    return CURRENT_CONFIG || INFORSCHEMA_CONFIG ||  DEFAULT_CONFIG;
  }
})
Template.OutInForSchema.onCreated(function(){
  this._root = this.data;
})
Template.OutInForSchema.helpers({
  "root": function(){
    return Template.instance()._root
  },
  'template': function () {
    if (this.config && this.config.isInput) {
      return 'inputSchema'
    }
    return 'viewSchema'
  },
  'outPutData': function () {
    if (this.config && this.config.isFullData) {
      return {key: this.key}
    }
    return this;
  },
  'outPutDataWithBlock': function() {
    if (this.config && this.config.isFullData) {
      return {key: this.key, is_block: true}
    }
    this.is_block = true;
    return this;
  }
})