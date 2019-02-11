import GetData from  'meteor/study:form-widget'


Template.inputActionSpan.events({
  'click .input-action-span': function (e, tpl) {
    let el = $(e.currentTarget);``
    let input = el.parents('.input-group').find('input');
    let form = el.parents('form');
    let eMethod = el.data('method');
    let eClient = el.data('client');
    let sTrue = el.data('strue');
    let sFalse = el.data('sfalse');
    let inputIns = InputSchema.of()

    let data = GetData.inInput(input)
    if (eMethod) {
      BaseTemplate.of().post(eMethod, inputIns.get(), {silent: true}, function(err, result){
        if (err || !result) {
          inputIns.do(sFalse);
          return;
        }
        inputIns.do(sTrue, result);
      })
      return
    }
    if (eClient) {
      let eClientParse = eClient.split('.');
      if (eClientParse < 2) {
        dsLog.error("wrong config, please contact tech for support!")
        return
      }
      dsLog.info('[CALL] ' + eClient);
      Client[eClientParse[0]].of()[eClientParse[1]](data).then((result) =>{
        if (!result) {
          inputIns.do(sFalse);
          return
        }
        inputIns.do(sTrue);
      }).catch((error)=> {
        inputIns.do(sFalse);
        dsLog.error(error.message);
      })
    }
  }
})
