const common = require('../common')
Template['list.checkboxInput'].onCreated(function () {
  this._inputIns = InputSchema.of();
})
Template['list.checkboxInput'].helpers(common.listValueHelpers)
