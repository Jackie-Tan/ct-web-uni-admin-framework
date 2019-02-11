import GetData from  'meteor/study:form-widget'


Template.removeConfirmModal.events({
  'click .confirm-yes-btn': function(e, tpl){
    e.preventDefault();
    Session.set('isLoadingScreen', true);
    GetData.inForm(tpl, { useBH: false },function(err, data){
      if (err){
        dsLog.error(err);
        return;
     }
      const instance = BaseTemplate.of();
      const method = instance._method+'/Remove';
      dsLog.info('[CALL] '+method);
      Meteor.call(method, {id: tpl.data.id}, function(error, result){
        Session.set('isLoadingScreen', false);
        if (error){
          dsLog.error(error.message);
          return;
        }
        tpl.$('.hide-modal').click();
        BaseTemplate.of().reloadWithId(tpl.data.id);
        dsLog.success('Remove success!');
      })
    });

  }
})
