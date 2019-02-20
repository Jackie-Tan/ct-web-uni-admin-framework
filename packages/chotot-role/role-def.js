
function sliceArg(arg) {
  return Array.prototype.slice.call(arg, 1);
}
RoleDef = {
  "extend": function (key, role, opt = {}) {
    if (RoleDef[key]) {
      throw new Error('It was declare')
    }
    if (!role.user_key || !role.validator || !role.do) {
      throw new Error('wrong role config!')
    }
    RoleDef[key] = role;
  },
  "action": {
    "user_key": "role_actions",
    "validator": {
      "undefined": function () {
        return
      },
      'pass': function (levels, ref) {
        let refSplit = ref.split('.');
        let tName = refSplit[0];
        let aName = refSplit[1] || "";
        aName = aName.toLowerCase();
        let template = BaseTemplate.of(tName)._config;
        let actionCfgs = template.actions_config || {};
        if (!actionCfgs[aName])
          return
        let role = actionCfgs[aName].role;
        logger.trace('role validator action', role)
        console.log('DEBUGLOG',levels,`${tName}.${role}`)
        if (levels.indexOf(`${tName}.${role}`) == -1)
          throw new Meteor.Error('You do not have permission for this ' + ref);
      }
    },
    "do": {
      "user_roles": function (user, ref) {
        return user[this._key];
      },
      "map": function (roles) {
        if (!Array.isArray(roles))
          roles = [roles]
        return roles || []
      },
    }
  },
  "global": {
    "user_key": "role",
    "validator": {
      "pass": function () {
        return true;
      }
    }
  },
  "method": {
    "user_key": "role"
  },
  "db": {
    "user_key": "role_db"
  },
  "block": {
    "user_key": "is_block",
    "validator": {
    }
  },
  "system": {
    "validator": {
      "not_admin": function () {
        throw new Error('Bạn không có quyền!')
      }
    }
  },
  //By default
  "collection": {
    "user_key": "role",
    "validator": {
      "undefined": function () {
        throw new Error('User chưa được set quyền!')
      },
      "compare": function (from, to) {
        let self = this;
        if (self.do("is_super_admin", from))
          return;
        if (self.do("is_super_admin", to))
          throw new Error('user bị tác động có quyền super admin!');
        //admin can update info another  
      },
      'pass': function (levels, ref) {
        let roles = this.do("map", this.do("conf_roles", ref));
        let isPass = false;
        // to string for compare indexOf
        levels = levels.map(function(i) {
          return ""+i;
        });
        for (let element of roles) {
          element = ""+ element;
          let andRoles = element.split('&&');
          let count = 0
          // logger.debug('check Roles', andRoles, element, levels);
          andRoles.forEach((role) => {
            if (levels.indexOf(role) != -1) {
              count = count + 1
            }
          });
          if (count == andRoles.length) {
            isPass = true;
            break;
          }
        }
        if (!isPass)
          throw new Meteor.Error('You do not have permission for this ' + this._type, ref);
      }
    },
    "do": {
      "conf_roles": function (ref) {
        let refConf = BaseTemplate.load(ref)._config || {};
        let roleField = (refConf.roles_config || {}).conf || "roles";
        return refConf[roleField];
      },
      "user_roles": function (user, ref) {
        let refConf = BaseTemplate.load(ref)._config || {};
        let roleField = (ref && (refConf.roles_config || {}).user) || this._key;
        return user[roleField];
      },
      "manage_roles": function(levels) {
        if (this.do("is_super_admin", levels)) {
          return [{}];
        }
        let result = [];
        const {ROLE_MANAGES} = require('meteor/chotot:role/role-helpers');
        for (let lvl of levels) {
          let role = parseInt(lvl);
          if (this.do("is_admin", role)) {
            result.push({[this._key]: {$in: ROLE_MANAGES[role] || []}});
          }
        }
        return result;
      },
      "levels": function (user, ref) {
        if (!user)
          throw new Meteor.Error('the user is not exist!');
        const levels = this.do("user_roles", user, ref);
        if (typeof levels == 'undefined' || levels == null)
          this.validator('undefined')
        return this.do("map", levels);
      },
      "map": function (levels) {
        if (typeof levels == 'string')
          levels = levels.split(',');
        if (typeof levels == 'number')
          return [levels];
        if (!Array.isArray(levels))
          return [];
        let result = [];
        for (let item of levels) {
          if (item === 0 || item) {
            result.push(item)
          }
        }
        return result;
      },
      "max": function (levels) {
        return Math.max(...levels);
      },
      "is_admin": function(lvl) {
        let level = parseInt(lvl);
        return level !== 0 && level% 100 == 0;
      },
      "is_super_admin": function (levels) {
        return levels.indexOf(0) != -1 || levels.indexOf("0") != -1;
      },
      "is_not_enable": function () {
        return (process.env.IS_PREVENT_ROLE === "false" || process.env.IS_PREVENT_ROLE === false)
      },
      "out_scope": function(from, to) {
        let out = [];
        let fromAdmins = {};
        from.forEach((i) => {
          let ii = parseInt(i);
          let i_admin =  !ii && Math.trunc(ii/100)*100 || i;
          fromAdmins[i_admin]=true;
        })
        to.forEach((i) => {
          let ii = parseInt(i);
          let i_admin =  !ii && Math.trunc(ii/100)*100 || i;
          if (!fromAdmins[i_admin]) {
            out.push(i);
          }
        });
        return out;
      }
    },
  }

}
class roleDef {
  constructor(type) {
    this._type = type;
    this._config = RoleDef[type] || {}
    this._key = this._config.user_key
    roleDefIns[type] = this;
  }
  static of(type) {
    logger.trace('type check is', type)
    if (!type) {
      type = 'collection'
    }
    return roleDefIns[type] || new roleDef(type)
  }
  validator(err) {
    if (this.do("is_not_enable")) {
      return this;
    }
    let params = sliceArg(arguments)
    logger.trace(`validator ${err} with params`, params)
    let vd = this._config.validator || {}
    let func = vd[err] || RoleDef.collection.validator[err];
    if (!func) {
      throw new Error(`validator ${err} chưa được khai báo!`)
    }
    func.apply(this, params)
    return this;
  }
  do(action) {
    let params = sliceArg(arguments)
    logger.trace(`do action ${action} with params`, params)
    let vd = this._config.do || {}
    let func = vd[action] || RoleDef.collection.do[action];
    if (!func) {
      throw new Error(`role def do action ${action} chưa được khai báo!`)
    }
    return func.apply(this, params)
  }
}
var roleDefIns = {};
roleDef.user_keys = [];
let hadKeys = {};
for (let key in RoleDef) {
  let user_key = RoleDef[key].user_key
  if (user_key && !hadKeys[user_key]) {
    roleDef.user_keys.push(user_key);
    hadKeys[user_key] = true;
  }
}
module.exports = roleDef
