Template.multiselectInput.onCreated(function(){
  dsLog.debug('create multiselect ref ')
  this.refData = new ReactiveVar([]);
  const self = this;
  const config = this.data.input.ref;
  let inputIns = this.inputIns = InputSchema.of()
  self.autorun(function() {
    if (typeof config == 'function') {
      return config.call(inputIns, {}, function (data) {
        self.refData.set(data);
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
        self.refData.set(res.data.map(function(resItem){
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

Template.multiselectInput.onRendered(function () {
  this.$('.multiselect').multiselect({
    buttonClass: ' multiselect-new',
    numberDisplayed: this.inputIns._input.numberDisplayed || 1,
    maxHeight: this.inputIns._input.maxHeight || 200
  })
})
Template.multiselectInput.helpers({
  'data': function(){
    const tpl = Template.instance()
    return tpl.refData.get();
  },
  "disabled": function(){
    if (this.is_disable)
      return "disabled"
    return ""
  },
  'selected': function(){
    let inputIns = Template.instance().inputIns
    let values = inputIns.get()|| []
    if (values.indexOf(this.value) != -1)
      return "selected"
    return ""
  }
})

