const navDefault = []
Template.navigation.helpers({
  'navList': function(){
    let tpl = Template.instance();
    return tpl._nav;
  },
  'navReady': function() {
    let tpl = Template.instance();
    return tpl._navReady.get()
  },
  'navHidden': function() {
    return this.children.filter((i) => {
      return i.hidden !== true;
    }).length == 0;
  },
  'emailUser': function(){
    const user = Meteor.user();
    if (!user)
      return;
    return user.emails && user.emails[0].address
  },
  'isActiveRoute': function(cls){
    const regexArr = this.regex.split('|');
    if (regexArr.indexOf(Router.current().route.getName()) != -1)
      return cls;
    return '';
  }
})
Template.navigation.onCreated(function(){
  this._nav = [];
  this._navReady = new ReactiveVar();
})
Template.navigation.rendered = function () {
  let self = this;
  this.comp = this.autorun(function(){
    let nav = Session.get('GLOBAL_NAVLIST') || navDefault;
    if (!nav.length)
      return;
    self._nav = nav;
    self._navReady.set(false);
    setTimeout(function(){
      self._navReady.set(true);
      setTimeout(function(){
        self.$('#side-menu').metisMenu({
          preventDefault: false
        });
      })
    },100);
    
  })
};

// Used only on OffCanvas layout
Template.navigation.events({

  'click .close-canvas-menu': function () {
    $('body').toggleClass("mini-navbar");
  }

});
