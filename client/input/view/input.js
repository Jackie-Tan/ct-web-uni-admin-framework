Template.viewInput.onCreated(function () {
  this.tValue =  ReactiveVar("")
  let input = this.data.input
  if (!input)
    return ""
  let tpl = this;
  let inputIns = InputSchema.of()
  if (typeof input.ref == 'function') {
    tpl.autorun(function () {
      input.ref.call(inputIns, {}, function (err, resp) {
        if (err){
          dsLog.error(err.message)
          return
        }
        tpl.tValue.set(Spacebars.SafeString(resp))
      })
    })

  }
})
Template.viewInput.helpers({
  'ref': function () {
    return Template.instance().tValue.get()
  }
})