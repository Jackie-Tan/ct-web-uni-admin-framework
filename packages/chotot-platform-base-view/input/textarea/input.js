Template.textareaInput.onCreated(function () {
  this._inputIns = InputSchema.of()
})
Template.textareaInput.helpers({
  'refClass': function () {
    let input = Template.instance()._inputIns._input
    return input && input.refClass
  },
  'max': function () {
    let max = Template.instance()._inputIns._input.max
    return max && {"maxlength": max} || ''
  },
  'required': function () {
    let isOptional = Template.instance()._inputIns._oConfig.isOptional
    return !isOptional && `required`|| ''
  }
})
