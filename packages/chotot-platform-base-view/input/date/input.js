Template.dateInput.helpers({
  'type': function () {
    let inputCfg = Template.instance()._inputIns._input
    if (inputCfg) {
      return inputCfg.subtype || inputCfg.type || "date"
    }
  }
})
Template.dateInput.onCreated(function () {
  this._inputIns = InputSchema.of();
})

Template.dateInput.onRendered(function(){
  let self = this;
  let value = this._inputIns.get();
  let inputCfg = this._inputIns._input
  let options = {
    format: 'MM/DD/YYYY'
  }
  let mapValue = function(value){
    if (inputCfg.map)
      return inputCfg.map(value)
    return value;
  }
  if (value) {
    options.defaultDate = new Date(mapValue(value))
  }
  if (inputCfg.fromToday) {
    options.minDate= new Date()
  }
  options = _.extend(options, inputCfg.date_opts || {})
  let el = self.$('.datetimepicker')
  let dti = el.datetimepicker(options);
  let dp = this._inputIns.dp = dti.data('DateTimePicker');
  el.on('dp.change', function(e){
    self._inputIns.set(dp.date())
  })
  self.autorun(function () {
    if (typeof inputCfg.ref == 'function') {
      inputCfg.ref.call(self._inputIns, {})
    }
  });
})