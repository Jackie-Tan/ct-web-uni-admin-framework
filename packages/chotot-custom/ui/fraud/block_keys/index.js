import GetData from  'meteor/study:form-widget'

Template.f_keyCustom.helpers({
  'tData': function(){
    const tpl = Template.instance();
    return tpl.tData.get();
  }
})

Template.f_keyCustom.onCreated(function(){
  this.tData = new ReactiveVar([]);
  this.data.reload = new ReactiveVar();
})

Template.f_keyCustom.onRendered(function(){
  const method = BaseTemplate.instances[this.data.name].method+'/GetKey';
  const self = this;
  this.autorun(function(){
    self.data.reload.get();
    Meteor.call(method, function(error, res){
      if (error){
        dsLog.error(error.message);
        return;
      }
      self.tData.set(res.result || []);
    })
  });
})

Template.f_keyCustom.events({
  'click #remove': function(e, tpl){
    e.preventDefault();
    Session.set('isLoadingScreen', true);
    const { key } = e.currentTarget.dataset;
    const method = BaseTemplate.instances['f_fraud'].method+'/RemoveKey';
    dsLog.info('[CALL] '+method);
    Meteor.call(method, {text: key}, function(error, result){
      Session.set('isLoadingScreen', false);
      if (error){
        dsLog.error(error.message);
        return;
      }
      tpl.$('.hide-modal').click();
      document.location.reload(true);
      dsLog.success('success!');
    })
  },
  'click #removeall': function(e, tpl){
    e.preventDefault();
    Session.set('isLoadingScreen', true);
    const { key } = e.currentTarget.dataset;
    const method = BaseTemplate.instances['f_fraud'].method+'/RemoveKey';
    dsLog.info('[CALL] '+method);
    Meteor.call(method, {}, function(error, result){
      Session.set('isLoadingScreen', false);
      if (error){
        dsLog.error(error.message);
        return;
      }
      tpl.$('.hide-modal').click();
      document.location.reload(true);
      dsLog.success('success!');
    })
  },
})