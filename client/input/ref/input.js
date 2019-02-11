// REF  TYPE
Template.selectRefOptions.onCreated(function(){
  dsLog.debug('create select ref ')
  const self = this;
  let inputIns = this._inputIns = InputSchema.of();
  const config = inputIns._input.ref;
  self.autorun(function() {
    if (typeof config == 'function') {
      return config.call(inputIns, {}, function (data) {
        inputIns.put("ref", data);
      })
    }
  })
  if (config && config.table){
    if (!config.driver && config.value && config.cols){
      const options = {
        limit: 1000,
        offset: 0,
        columnSearch: config.columnSearch || []
      }
      BaseMethod.of(config.table).post('Get', options, {silent: true}, function (err, res) {
        if (!res.data)
          return
        inputIns.put("ref", res.data.map(function(resItem){
          let string = "";
          config.cols.map(function(item){
            string += (resItem[item] + " ")
          })
          return { value: resItem[config.value], display: string};
        }));
      })
    }
  }
})
Template.selectRefOptions.helpers({
  'data': function(){
    return Template.instance()._inputIns.watching("ref");
  },
  "disabled": function(){
    if (this.is_disable)
      return "disabled";
    return "";
  },
  'selected': function(){
    if (this.value == Template.instance()._inputIns.get())
      return "selected";
    return "";
  }
})
