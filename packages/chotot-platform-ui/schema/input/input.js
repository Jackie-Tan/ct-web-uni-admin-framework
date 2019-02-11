
Template.inputSchema.onCreated(function () {
  this._schema = BaseSchema.of();
  try {
    let tplData = this.data;
    let opt = tplData.opt || {};
    opt.data = opt.data || tplData.opt_data;
    let inputIns = this._inputIns = new InputSchema(this._schema._id, this.data.key, this, opt);
    let config = inputIns._oConfig;
    let {rootClass, displayClass, boundClass, labelClass, style} = _.extend(config.input || {}, opt);
    displayClass = displayClass || 'form-group col-md-12';
    var helpers = {
      key(){
        return tplData.key || config.key;
      },
      enable() {
        return this._enable.get() || config.use_view;
      },
      inputByTemplate() {
        if (config.spacebar)
          return 'inputByDynamic';
        if (!this._enable.get() && config.use_view) {
          return 'inputByView';
        }
        return 'inputByHelpers';
      },
      schemaName: config.schema_wrap && config.schema_wrap.name,
      schemaOpt: config.schema_wrap && config.schema_wrap.opt,
      rootClass: inputIns.getRootClass(),
      style,
      inputConfig(){
        let config = this._config.get();
        let hiddenClass = this._hide.get() && 'hidden' || '';
        let actionClass = this._input.action && 'input-group' || ''
        _.extend(config, { displayClass, boundClass, labelClass, hiddenClass, actionClass});
        config.originKey = this._key;
        return config;
      }
    };
    originViewLookup = this.view.lookup;
    this.view.lookupTemplate = function(name) {
      return originViewLookup(name, {template: true});
    };
    this.view.lookup = function(lookupName){
      let args = Array.prototype.slice.call(arguments, 1);
      if (typeof helpers[lookupName] == 'function') {
         return helpers[lookupName].apply(inputIns, args);
      }
      return helpers[lookupName] || '';
    }
    
  } catch (e) {
    console.error(`config error at schema`, this._schema._id);
  }
});
Template.inputSchema.onDestroyed(function(){
  Template.instance()._inputIns && Template.instance()._inputIns.destroy();
})
