function createUser(email, password) {
  try {
    return Accounts.createUser({
      email: email,
      password: password,
      profile: {
        reg_code: process.env.DS_PASSWORD || "chotot123"
      }
    });
  } catch (e) {
    logger.warn('user is exist!', email, e);
  }
}
function updateUser(options, user) {

  if (!Accounts.serviceMap[options.type]) {
    throw new Meteor.Error(`your service ${options.type} was not supported`)
  }
  Accounts.serviceMap[options.type](options, user)
  let old_user = Meteor.users.findOne({ 'emails.address': user.emails[0].address })
  if (!old_user) {
    return user
  }
  Meteor.users.update({ _id: old_user._id }, { $set: { [`services.${options.type}`]: user.services[options.type] } })
  return user
}
Meteor.startup(function () {
  try {
    let smtp = {
      username: process.env.USER_NAME_EMAIL,   // eg: server@gentlenode.com
      password: process.env.USER_NAME_PASSWORD,   // eg: 3eeP1gtizk5eziohfervU
      server: 'smtp.gmail.com',  // eg: mail.gandi.net
      port: 465
    }
    process.env.MAIL_URL = 'smtps://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
  } catch (e) {
    console.error(e);
  }
  Accounts.validateLoginAttempt(function (attempt) {
    if (attempt.user && attempt.user.is_block) {
      return false;
    }
    if (attempt.user && attempt.user._id)
      return true


  })
  Accounts.onCreateUser((options, user) => {
    let sv = user.services
    let keys = Object.keys(sv)
    for (let key of keys) {
      if (["password", "resume"].indexOf(key) != -1) {
        continue
      }
      options.type = key
      return updateUser(options, user)
    }
    if (!process.env.DS_PASSWORD)
      return user;
    if (!options.profile || options.profile['reg_code'] != process.env.DS_PASSWORD) {
      throw new Meteor.Error('internal');
    }
    return user;
  });
  const user = Meteor.users.find({ role: 0 }).fetch();
  if (user.length)
    return;
  const userId = createUser("admin-ds@chotot.vn", process.env.ADMIN_PASSWORD || "123456");

  Meteor.users.update({ _id: userId }, { $set: { role: [0], role_db: [0] } });
})

import Role from 'meteor/chotot:role/role.js'
Meteor.secureMethods({
  'Global/Users/MigrateRoleToString': function () {
    let users = Meteor.users.find({}).fetch();
    for (let u of users) {
      let role = u.role;
      if (Array.isArray(role)) {
        Meteor.users.update({ _id: u._id }, { $set: { role: role.map(i => "" + i) } });
      }
    }
  },
  'Global/Users/CreateUser': function (data) {
    // no need encrypt from client for only internal
    // every admin and super admin can create user but in its scope
    return Role.of(Meteor.userId()).checkBaseRole(null, [
      function () {
        createUser(data.emails, data.password)
      }
    ]);
  },
  'Global/Users/CreateUserWithRole': function (data) {
    // no need encrypt from client for only internal
    let roleIns = Role.of(Meteor.userId())
    return roleIns.checkBaseRole(null, [
      function () {
        let user = Meteor.users.findOne({ 'emails.address': data.emails })
        if (!user) {
          data._id = createUser(data.emails, data.password)
        } else {
          data._id = user._id;
        }
        delete data.emails;
        delete data.password;
        delete data.verify_password;
        roleIns.updateInfo(data);
      }
    ]);
  },
  'Global/Users/SetPasswordByEmail': function (data) {
    let user = Meteor.users.findOne({ 'emails.address': data.emails })
    if (!user) {
      throw new Meteor.Error('can not find the user')
    }
    data._id = user._id;
    delete data.emails;
    return Role.of(Meteor.userId()).setPassword(data);
  },
  'Global/Users/UpdateInfoByEmail': function (data) {
    let user = Meteor.users.findOne({ 'emails.address': data.emails })
    if (!user) {
      throw new Meteor.Error('can not find the user')
    }
    data._id = user._id;
    delete data.emails;
    return Role.of(Meteor.userId()).updateInfo(data);
  },
  'Global/Users/UpdateInfo': function (data) {
    delete data.verify_password;
    delete data.password;
    delete data.emails;

    return Role.of(Meteor.userId()).updateInfo(data);
  },
  'Global/Users/ResetPassword': function (data) {
    let action_user = Role.of(Meteor.userId()) // current (logined user) admin that do set password for target user
    let currentAdminEmail = action_user._user.emails[0].address;
    let emailSend = data.email_address;
    if (emailSend === 'admin-ds@chotot.vn') {
      emailSend = 'phatvo@chotot.vn';
    }
    action_user.setPassword(data)
    Email.send({
      from: '',
      to: emailSend,
      subject: 'Chotot: Admin-Center Reset Password',
      html: `
          ${currentAdminEmail} has changed your password. Please login again at: ${process.env.ROOT_URL}/signout with:
          <p>Email: <b>${data.email_address}</b></p>
          <p>New Password: <b>${data.new_password}</b></p>
          `
    })
  },
  'Global/Users/Get': function (opt = {}) {
    let { query = {}, limit = 10, offset = 0, sort = '', columnSearch = [] } = opt;
    let userQuery = { $and: [query, { $or: Role.of(this.userId).manageRoles("collection") }] };
    for (let searchCol of columnSearch) {
      if (searchCol.key != 'emails') {
        continue;
      }
      query['emails.address'] = { $regex: new RegExp(`${searchCol.search}`) };
    }
    const sortSplit = sort.split(' ');
    console.log(JSON.stringify(userQuery));
    let dataC = Meteor.users.find(userQuery, { limit, skip: offset, sort: [sortSplit] });
    let lengthC = Meteor.users.find(userQuery);
    return { data: dataC.fetch(), length: lengthC.count() };
  },
  'Global/Users/GetById': function (opt) {
    return Role.of(Meteor.userId()).getUser(opt);
  },
  'Global/Users/GetCurrentRole': function (type) {
    return Role.of(Meteor.userId()).get(type);
  },
  'Global/Tracing/Action': function ({ id, duration } = {}) {
    if (id && duration)
      logger.stats(`${id}`, "200", duration)
    // logger.action("tracing", this.connection.clientAddress, {arguments}, "global")
  },
  'sendEmail': function (to, from, subject, text, replyTo) {
    Email.send({ to, from, subject, html: text, replyTo });
  }
}, { type: 'global', name: 'global' });

Meteor.users.deny({
  'insert': function () {
    return true;
  },
  'update': function () {
    return true;
  }
})

Meteor.publish(null, function () {
  if (this.userId) {
    return Meteor.users.find({ _id: this.userId })
  }
});
