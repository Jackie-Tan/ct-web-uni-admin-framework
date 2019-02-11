var dAction = require('./d-action')
Template.baseDetailAction.onCreated(function(){
  let data = this.data
  let actionIns = this.actionIns = dAction.of(BaseSchema.of(), data.action, data)
  this.autorun(function () {
    data.pong && data.pong.call(actionIns);
  })
})
Template.baseDetailAction.onRendered(function () {
  let data = this.data
  this.actionIns.events(data.events, this)
})
Template.baseDetailAction.helpers({
  'getTemplate': function () {
    let action = this.action
    const btnArr = ("" + action).split('.');
    const name = (btnArr.length
        ? btnArr[0]
        : action) + 'BtnDetailAction';
    if (!Template[name])
      return 'defaultBtnDetailAction';
    return name;
  },
  "enable": function () {
    let actionIns = Template.instance().actionIns
    return actionIns._enable.get()
  }
})
