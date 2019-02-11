Template.loader.helpers({
  'isLoading': function(){
    return Session.get('isLoadingScreen');
  }
})
Template.loader.onCreated(function(){
  Session.set('isLoadingScreen');
})
