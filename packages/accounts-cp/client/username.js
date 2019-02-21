import { setCookie, removeCookie } from './cookie'

AccountsTemplates.addField({
  _id: 'username',
  type: 'text',
  func: function (value) {
    return value
  },
});

const sha1 = require('sha1');
var oldLoginSystem = Meteor.loginWithPassword
Meteor.hashCPPassowrd = function (value) {
  return sha1(value);
}
Meteor.cpInfo = function (key) {
  let user = Meteor.user();
  let cpInfo = (user && user.services.cp) || {};
  return (key && cpInfo[key]) || cpInfo
}
Meteor.oldLoggingIn = Meteor.loggingIn;
var isCPLoggingIn = new ReactiveVar(true);
Meteor.loggingIn = function () {
  return isCPLoggingIn.get() && Meteor.oldLoggingIn();
}
Meteor.loginWithPassword = function (user, password, cb) {
  if (user.indexOf("@") != -1) {
    return oldLoginSystem.apply(Meteor, arguments);
  }
  isCPLoggingIn.set(true);
  return Accounts.callLoginMethod({
    methodArguments: [{ cp: { username: user, password: Meteor.hashCPPassowrd(password) } }],
    userCallback: function (err) {
      if (!err) {
        setTimeout(function () {
          isCPLoggingIn.set(false);

          // set cookie with timeout 1 hour on login
          setCookie('s', Meteor.user().services.cp.token, 3600, getDomain(meteorEnv.NODE_ENV))
        }, 0)
        return Meteor.logoutOtherClients(cb)
      }
      cb && cb(err);
    }
  });
}

Accounts.onLogin(function () {
  Meteor.call('Global/User/VerifyToken');
})

Accounts.onLogout(function () {
  // remove cookie when logout
  removeCookie('s', getDomain(process.env.NODE_ENV))
})

const getDomain = (env) => {
  let domain = '.dev.com'
  if (env === 'development') {
    domain = '.chotot.org'
  }
  if (env === 'production') {
    domain = '.chotot.com'
  }
  return domain
}