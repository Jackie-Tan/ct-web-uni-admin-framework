import Navigation from "./navigation";

function notHaveId(item, name){
  if (item.id == name){
    return false;
  }
  for (let child of (item.children || [])) {
    if (!notHaveId(child, name))
      return false;
  }
  return true;
}
function notInNavigation(name){
  const nav = Session.get('GLOBAL_NAVLIST');
  for (let child of (nav || [])) {
    if (!notHaveId(child, name))
      return false;
  }
  return true;
}
BaseTemplate._ready = new ReactiveVar();
Tracker.autorun(function(){
  let user = Meteor.user();
  if (!user) {
    return;
  }
  if (BaseTemplate._ready.curValue)  {
    return;
  }
  Meteor.call('Global/GetConfig', function (err, modules) {
    for (let m in modules) {
      try {
      let tmpModule = {exports: {}};
      eval(modules[m])(tmpModule);
      let config = tmpModule.exports;
      new BaseTemplate(m, config);
      new Navigation(m, config);
      } catch (e) {
        console.warn('please check config', e);
      }
    }
    Session.set('GLOBAL_NAVLIST', Navigation.items.home.children);
    // console.log('baseTemplate set ready');
    BaseTemplate._ready.set(true);
  })
});
