const roleDef = require('./role-def')
class Role {
  constructor(userId) {
    this.userId = userId;
    this._user = Meteor.users.findOne(this.userId);
  }
  static of(userId) {
    return new Role(userId)
  }
  get(type, user) {
    let roleDefIns = roleDef.of(type)
    return roleDefIns.do("levels", user || this._user)
  }
  isSuperAdmin() {
    let roleDefIns = roleDef.of()
    const levels = roleDefIns.do("levels", this._user)
    return { is_super_admin: roleDefIns.do("is_super_admin", levels), levels }
  }
  checkSuperAdmin() {
    let { is_super_admin } = this.isSuperAdmin()
    return is_super_admin;
  }
  pass(type, ref) {
    let { is_super_admin } = this.isSuperAdmin()
    logger.trace('is admin', is_super_admin)
    if (is_super_admin)
      return this;
    let roleDefIns = roleDef.of(type)
    const levels = roleDefIns.do("levels", this._user, ref)
    roleDefIns.validator('pass', levels, ref)
    return this;
  }
  manageRoles(type, ref) {
    let roleDefIns = roleDef.of(type)
    const levels = roleDefIns.do("levels", this._user, ref)
    return roleDefIns.do("manage_roles", levels);
  }
  getUser(opt) {
    let { is_super_admin, levels } = this.isSuperAdmin()
    if (is_super_admin) {
      let dataC = Meteor.users.findOne({ _id: opt._id });
      return { data: dataC };
    }
    let dataC = Meteor.users.findOne({ role: { $in: levels }, _id: opt._id })
    return { data: dataC };
  }

  checkBaseRole(userId, nexts = []) {
    //IF superAdmin, go ahead
    //IF a user is Admin of a module He would have all permisison in this module
    let {levels } = this.isSuperAdmin()
    const user = Meteor.users.findOne(userId) || {};
    let roleIns = roleDef.of('collection');
    let currentRoles = roleIns.do("map", user.role);
    roleIns.validator("compare", levels, currentRoles);
    for (let next of nexts) {
      next();
    }
  }
  extendInfo(data) {
    let {levels } = this.isSuperAdmin();
    const user = Meteor.users.findOne(data._id) || {};
    let roleIns = roleDef.of('collection');
    for (let key of roleDef.user_keys) { 
      if (!data[key])
        continue;
      let currentRoles = roleIns.do("map", user[key]);
      //keep role out of scope this admin
      let outScope = roleIns.do('out_scope', levels, currentRoles);
      data[key] = _.union(outScope, roleIns.do("map",data[key]));
    }
  }

  updateInfo(data) {
    this.checkBaseRole(data._id);
    //get roles out of its scope
    this.extendInfo(data);
    return Meteor.users.update({ _id: data._id }, { $set: data });
  }
  setPassword(data) {
    this.checkBaseRole(data._id);
    Accounts.setPassword(data._id, data.new_password);
  }
}

export default Role;
