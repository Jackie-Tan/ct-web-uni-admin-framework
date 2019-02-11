const onDifSpecialRoute = function () {
  return window.location.href != Meteor.absoluteUrl(window.location.hash || "#");
}
const onForceSignOut = function() {
  return onDifSpecialRoute() && !Meteor.user() && !Meteor.loggingIn();
}
var requiredUser = function (router) {
  CachingRouteSet();
  if (onForceSignOut()) {
    Router.go('/signoutForce');
    Router.stop();
    return;
  }
  let layout = 'mainLayout'
  try {
  layout = BaseTemplate.of().config.layout || layout;
  } catch (e) {
    //ignore it
  }
  router.layout(layout);
  router.next();
};

Meteor.startup(function(){
  Tracker.autorun(function(){
    if (BaseTemplate._ready.get()){
      Router.start();
    }
  })
});

function checkPath(path) {
  return ['/signoutForce', '/signin', '/join', '/forgot-password', '/signout'].indexOf(path) == -1
}
Router.waitOn(function () {
  return [
    function () {
      if (checkPath(Router.current().route.path()))
        return !Meteor.loggingIn();
      return true;
    }
  ];
})
Router.onBeforeAction(function () {
  // all properties available in the route function
  // are also available here such as this.params

  if (checkPath(Router.current().route.path())) {
    // if the user is not logged in, render the Login template

    return requiredUser(this);
  }
  this.layout('blankLayout')
  // otherwise don't hold up the rest of hooks or our route/action function
  // from running
  this.next();
});

//
// Dashboards routes
//
CachingRoute = "";
var getPathFromOrig = function(originPath) {
  return originPath.split('?')[0].replace(window.location.origin,'');
}
var checkCachingRoute = function(originPath) {
  let path = getPathFromOrig(originPath);
  return checkPath(path) && (['/', '/home'].indexOf(path) == -1);
}
var CachingRouteSet = function(opts = {}) {
  let routeOrigin = Router.current().originalUrl;
  let windowOrigin = window.location.href;
  let lastOrigin = routeOrigin;
  if (windowOrigin.indexOf(routeOrigin) != -1) {
    lastOrigin = windowOrigin;
  }
  let originPath = opts.originPath || lastOrigin;
  if (checkCachingRoute(originPath)) {
    CachingRoute = originPath.replace(window.location.origin,'')
  }
}
var backSignInWithCache = function(opts = {}) {
  let {error} = opts
  let url = `${window.location.origin}/signin?back_url=${escape(CachingRoute)}&error=${encodeURI(error || "")}`;
  window.location.href = url;
}
var RouterOptions = {
  notFoundTemplate: 'notFound',
}
if (checkCachingRoute(getPathFromOrig(window.location.href))) {
  let autoStart = false;
  if (onForceSignOut()) {
    backSignInWithCache();
  }
  RouterOptions.autoStart = false;
  RouterOptions.layout = 'blankLayout';
}
Router.configure(RouterOptions);
Router.route('/', function () {
  if (CachingRoute && checkCachingRoute(CachingRoute)) {
    Router.go(CachingRoute);
    return;
  }
  Router.go('/home');
})
Router.route('/home');


Router.route('/signout', {
  name: 'signout',
  action: function () {
    Meteor.logout();
    backSignInWithCache()
  }
});
Router.route('/signoutForce', {
  name: 'signoutForce',
  action: function() {
    backSignInWithCache({error: "Bạn mất quyền truy cập, vui lòng đăng nhập lại!"});
  }
})
// Define these routes in a file loaded on both client and server
AccountsTemplates.configureRoute('signIn', {
  name: 'signin',
  path: '/signin',
  onRun: function(){
    if (window.location.pathname != '/signin') {
      this.next();
      return;
    }
    let query = Router.current().params.query || {};
    let {error, back_url} = query;
    CachingRouteSet({originPath: back_url});
    if (error){
      setTimeout(() => {
        AccountsTemplates.state.form.set("error", [error]);
      }, 0);

    }
  }
});

AccountsTemplates.configureRoute('signUp', {
  name: 'join',
  path: '/join'
});

AccountsTemplates.configureRoute('forgotPwd', {
  name: 'forgotPwd',
  path: '/forgot-password'
});
