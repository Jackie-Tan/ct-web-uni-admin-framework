import GetData from  'meteor/study:form-widget'

Template.f_hammerCustom.helpers({
  'heads': function(){
    return [
      {
        "key": "account_id",
        "text": "Account Id",
        "input": {
          "type": "text",
          "placeholder": "Vui lòng nhập account_id"
        }
      },
      {
        "key": "reason",
        "text": "reason",
        "input": {
          "type": "text",
          "placeholder": "Vui lòng nhập reason"
        }
      }
    ]
  }
})

function banUser(e, tpl, action){
  GetData.inForm(tpl, { useBH: false },function(err, data){
    if (err){
      dsLog.error(err);
      return;
   }
   let method = BaseTemplate.instances[tpl.data.name].method+'/Ban';
   
   if (action == "unban") {
    method = BaseTemplate.instances[tpl.data.name].method+'/UnBan';
   }
   let postData = {
     "member_ids": [data["account_id"]],
     "reason": data["reason"],
     "by": "admin"
   }
  dsLog.info('[CALL] '+method);
  Meteor.call(method, postData, function(error, result){
      Session.set('isLoadingScreen', false);
      if (error){
        dsLog.error(error.message);
        return;
      }
      tpl.$('.hide-modal').click();
      dsLog.success('success!');
    })
  });
}

Template.f_hammerCustom.events({
  'click #ban': function(e, tpl){
    e.preventDefault();
    Session.set('isLoadingScreen', true);
    banUser(e, tpl)
  },
  'click #unban': function(e, tpl){
    e.preventDefault();
    Session.set('isLoadingScreen', true);
    banUser(e, tpl, "unban")
  }
})
