const common = require('../common');
Template.radioInput.onCreated(function(){
  let inputIns =this._inputIns = InputSchema.of();
  let input = inputIns._input;
  if (typeof input.ref != "function")
    return
  if (!this.refData)
    this.refData = new ReactiveVar([])
  let self = this
  self.autorun(function() {
    input.ref.call(inputIns, {}, function(data){
      self.refData.set(data)
    })
} )
})
Template.radioInput.helpers(common.listValueHelpers)

Template.radioRef.onCreated(function () {
  if (this.data.input) {
    BaseSchema.of().scale([this.data])
  }
})
Template.radioRef.events({
  "click .radio-bound": function (e, tpl) {
    tpl.$(e.currentTarget).find('[data-name][type=radio]:first-child').prop("checked", true).trigger('change');
  }
})