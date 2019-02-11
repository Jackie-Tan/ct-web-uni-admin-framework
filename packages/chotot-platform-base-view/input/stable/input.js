Template.stableInput.onCreated(function(){
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
Template.stableInput.helpers({
  'heads': function () {
    return Template.instance().refData.get()
  },
  'data': function () {
    return Template.instance().inputIns._schema.getData();
  }
})