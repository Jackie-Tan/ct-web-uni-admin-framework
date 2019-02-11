import GetData from  'meteor/study:form-widget'

Template.f_imagesAddData.helpers({
  'heads': function(){
    return [
      {
        "key": "image_url",
        "text": "Image URL",
        "input": {
          "type": "text",
          "placeholder": "Vui lòng nhập image url"
        }
      }
    ]
  }
})
Template.f_imagesAddData.events({
  'submit form': function(e, tpl){
    e.preventDefault();
    Session.set('isLoadingScreen', true);
    GetData.inForm(tpl, { useBH: false },function(err, data){
      if (err){
        dsLog.error(err);
        return;
      }
      const method = BaseTemplate.instances['f_fraud'].method+'/AddImages';
      dsLog.info('[CALL] '+method);
      Meteor.call(method, data, function(error, result){
        Session.set('isLoadingScreen', false);
        if (error){
          dsLog.error(error.message);
          return;
        }
        tpl.$('.hide-modal').click();
        document.location.reload(true);
        dsLog.success('success!');
      })
    });

  }
})
