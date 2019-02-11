Template.inputForm.onCreated(function () {
  let data = this.data;
  BaseSchema.of().addCfg(data.key, data);
})
Template.inputForm.helpers({
  'isInput': function () {
    return this.input
  }
})