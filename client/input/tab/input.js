Template.tabInput.onCreated(function(){
  this.refData = new ReactiveVar()
  this.inputIns = InputSchema.of()
  let ref = this.inputIns._input.ref
  let self = this;
  self.autorun(function() {
    if (typeof ref == 'function') {
      return ref.call(self.inputIns, {}, function (data) {
        self.refData.set(data);
      })
    }
  })
})
Template.tabInput.helpers({
  'heads': function () {
    return Template.instance().refData.get()
  }
})