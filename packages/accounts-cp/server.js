const { getCookie } = require('./client/cookie');
const Trans = require('./base/trans-msg');
const CPToken = require('./base/cp-token');
const Memcached = require('memcached');
const CPSUPERADMIN = "admin";


if (!Accounts.serviceMap) {
  Accounts.serviceMap = {}
}
Accounts.serviceMap.cp = function (options, user) {
  if (options.username)
    user.username = options.username;
  if (options.email)
    user.emails = [{
      address: options.email
    }];
}
const GEN_QUERY = function(to) {
  const {_id, admin_id} = to;
  let query = {_id};
  if (admin_id) {
    query = {"services.cp.id": admin_id};
  }
  return query;
}
Meteor.cpUpdateRoles= (from, to = {}) =>{
  if (from != CPSUPERADMIN) {
    return;
  }
  const {admin_privs} = to;
  role_queue = admin_privs && admin_privs.split(",");
  Meteor.users.update(GEN_QUERY(to), { $set: {role_queue, "services.cp.admin_privs": admin_privs}, $addToSet: { role: 901 } });
}
Meteor.cpRemoveUser = (from, to  = {}) => {
  if (from != CPSUPERADMIN) {
    return;
  }
  Meteor.users.remove(GEN_QUERY(to));
}
Accounts.registerLoginHandler('cp', function (options) {
  //TODO get service data
  //--- call to cp by trans and get token
  try {
    if (!options || !options.cp)
      return
    options = options.cp;
    console.log('options', options);
    let data = Trans.of().send('admin/login', 'POST', { username: options.username, passwd: options.password, remote_addr: '127.0.0.1', commit: '1' })
    data.id = data.admin_id;
    delete data.admin_id;
    data.cp_time = new Date() / 1000;
    CPToken.set(data.id, data.token)
    let result = {
      serviceName: 'cp',
      serviceData: data,
      options: {
        username: options.username,
        email: `${options.username}@cp.chotot`
      }
    };
    //TODO update or create user
    let res = Accounts.updateOrCreateUserFromExternalService(result.serviceName, result.serviceData, result.options);
    //TODO merge roles old cp to new cp
    Meteor.setTimeout(function () {
      let user = Meteor.users.findOne({ _id: res.userId });
      Meteor.cpUpdateRoles('admin', {_id: res.userId, admin_privs: data.admin_privs});
      // save info and privs to memcache for upm
      if (user) {
        saveUserInfoAndPrivsToMemcache(user)
      }
    }, 0)
    return res;
  } catch (e) {
    logger.error("error vao day", e);
    if (e.message.indexOf("ERROR_AUTH_LOGIN") != -1)
      return {
        type: "oauth",
        error: new Meteor.Error(
          new Accounts.LoginCancelledError("ERROR_AUTH_LOGIN"),
          "Sai tài khoản hoặc mật khẩu, vui lòng kiểm tra lại!")
      };
    // return { type: "oauth",
    //   error: new Meteor.Error(
    //     new Accounts.LoginCancelledError("ERROR_AUTH_LOGIN"),
    //     e.message) };
    return e;
  }

});

Accounts.onLogout(function (user) {
  // console.log(`data when logout: \n ${JSON.stringify(user)} \n`)
  if (user && user.user && user.user.services) {
    removeUserInfoAndPrivsFromMemcache(user.user.services.cp.token)
  }
})

ServiceConfiguration.configurations.remove(
  { service: 'CP' }
);

import { Accounts } from 'meteor/accounts-base'
Meteor.methods({
  'Global/Users/forceLogout': function () {
    if (this.userId && this.connection) {
      console.error(new Error('forceLogout'));
      Accounts._server.method_handlers.logout.call(this);
      Accounts._server.method_handlers.logoutOtherClients.call(this);
    }
  },
  'Global/User/VerifyToken': function () {
    let user = Meteor.user();
    // if (!user || !user.services.cp)
    if (!user)
      return;
    let now = new Date() / 1000;
    if ((now - user.services.cp.cp_time) / 60 > 60) {
      Meteor.call('Global/Users/forceLogout');
    }
    // New code for check other services (not CP)
    if (!user.services.cp) {
      const splitToken = getCookie('split_auth_token');
      if (splitToken === "") {
        Meteor.call('Global/Users/forceLogout');
      }
    }
  }
})

const saveUserInfoAndPrivsToMemcache = (user, timeout = 3600) => {
  // timeout second
  let username = user.username
  let fullname = user.services.cp.admin_fullname
  let id = user.services.cp.id
  let token = user.services.cp.token
  let admin_privs = user.services.cp.admin_privs.split(',')
  let privs = {}
  admin_privs.forEach(priv => {
    temp = priv.split('=')
    if (temp.length == 1) {
      privs[temp[0]] = true
    }
    if (temp.length == 2) {
      privs[temp[0]] = temp[1]
    }
  });

  let cache = {
    'controlpanel': {
      'admin': {
        id,
        privs,
        username,
        fullname
      }
    }
  }
  console.log('(memcache) data: ', JSON.stringify(cache))

  let mc = new Memcached(process.env.MEMCACHE_IP_PORT)
  mc.set(`${token}`, cache, timeout, function (err, data) {
    console.log(`(memcache) key: ${token}`)
    if (data) console.log('(memcache) saved info and privs:', data)
    if (err) console.log('(memcache) error: ', err)
    mc.end()
  })
}

const removeUserInfoAndPrivsFromMemcache = (key) => {
  let mc = new Memcached(process.env.MEMCACHE_IP_PORT)
  mc.del(key, function (err, data) {
    console.log(`(memcache) key: ${key}`)
    if (err) console.log('(memcache) error: ', err)
    if (data) console.log('(memcache) removed info and privs:', data)
    mc.end()
  })
}