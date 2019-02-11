Template['ojson.checkboxInput'].onCreated(function () {
  this.refData = new ReactiveVar([]);
  this._inputIns = InputSchema.of()
  let self = this;
  let inputCfg = this._inputIns._input
  if (typeof inputCfg.ref == 'function'){
    self.autorun(function(){
      inputCfg.ref.call(self._inputIns, [], function (data) {
        self.refData.set(data);
      })
    })
  }
})
Template['ojson.checkboxInput'].helpers({
  'Ref': function(){
    let inputCfg = Template.instance()._inputIns._input
    if (typeof inputCfg.ref == 'function') {
      let tpl = Template.instance()
      return tpl.refData.get()
    }
    return inputCfg.ref || []
  },
  'key': function(){
    return Template.instance()._inputIns._oConfig.key;
  },
  'checked': function(){
    let value = Template.instance()._inputIns.get() || [];
    if (typeof(value) == 'string') {
      value = value.split(',');
    }
    if (!Array.isArray(value)){
      value = [value]
    }
    let optValue = this instanceof String? this : this.value;
    return value.indexOf(""+optValue) != -1 || value.indexOf(optValue) != -1
  },
  'value': function () {
    return this instanceof String? this : this.value;
  },
  'text': function () {
    return this instanceof String? this : this.text;
  },
  'refClass': function() {
    return this.refClass || Template.instance()._inputIns._input.refClass
  }
})
