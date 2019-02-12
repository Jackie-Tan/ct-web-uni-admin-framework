var BaseMethod = require('./lib/method');
var BaseInternal = require('./lib/internal');
import ctp from 'meteor/chotot:platform-ctp/ctp.js';
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
function getName(mName, config) {
  const prefix = config.prefix;
      let prefixArray = prefix.split('/');
      prefixArray = prefixArray.map(function(text){
        return capitalizeFirstLetter(text);
      })
      prefixArray.push(mName);
  return prefixArray.join('/');
}
class baseTemplate {
  constructor(name, config) {
    try {
      this._name = name;
      // create Blaze Template
      BaseTemplate.Instances[name] = this;
      this._config = config;
      let methodIns = new BaseMethod(name, config);
      //add custom method
      let customMethods = BaseTemplate.getCache('method', name);
      let customActions = {}
      if (customMethods){
        for (let mKey in customMethods) {
          if (mKey == '_context')
            continue;
          if (mKey == 'Init') {
            customMethods[mKey].call(methodIns)
            continue;
          }
          customActions[mKey.toLowerCase()] = true
          methodIns.add(`${mKey}`,customMethods[mKey].bind(methodIns))
        }
      }
      this.addRole(config, customActions);
    } catch (err) {
      logger.error('ERROR config for name:'+ name, err.message || err.reason, err)
      logger.trace(err);
    }

  }
  static of(name, config) {
    if (BaseTemplate.Instances[name]) {
      return BaseTemplate.Instances[name]
    }
    new BaseTemplate(name, config);
  }
  static getCache(key, name) {
    const CACHING_KEY = `__${key}`;
    if (!BaseTemplate[CACHING_KEY])
      BaseTemplate[CACHING_KEY] = {};
    if (!name)
      return BaseTemplate[CACHING_KEY];
    return BaseTemplate[CACHING_KEY][name];
  }
  static caching(key, mi, conf) {
    const CACHING_KEY = `__${key}`;
    if (!BaseTemplate[CACHING_KEY])
      BaseTemplate[CACHING_KEY] = {};
    BaseTemplate[CACHING_KEY][mi] = conf;
  }
  static add(md) {
    //config
    const adminModules = require('meteor/chotot:platform-modules');
    const {ACTIONS} = require('meteor/chotot:platform-modules/config');
    let parent = {};
    let current = {};
    for (let cfgDir in ACTIONS) {
      let mConfig = adminModules.modules[md][cfgDir] || {};
      for (let mi in mConfig) {
        let name = md+'/'+mi;
        if (!current[name]) {
          current[name] = {md, mi, name, parent};
        }
        let conf = mConfig[mi]() || {}; 
        if (typeof conf == 'object') {
          conf._context = {md, mi, name};
        }
        ACTIONS[cfgDir].call(current[name], cfgDir, conf);
      }
    }
  }
  static imports(mds) {
    for (let md of mds) {
      try {
        BaseTemplate.add(md);
      } catch (e) {
        logger.warn(e);
      }
    }
  }
  addRole(config, customActions){
    let name = this._name;
    let acs =config.actions_config || {}
    for (let action in acs){
      let role = acs[action].role
      if (!role)
        continue;
      let action_key = action.toLowerCase();
      if (!customActions[action_key]) {
        logger.error(name, `please use same key action for method customized`, action_key)
      }
    }
    
    config.iRegister && config.iRegister.map(function(internalRoute){
      BaseInternal.add(internalRoute, name);
    });

  }
}
//export
BaseTemplate = baseTemplate;
BaseTemplate.Instances = {};
BaseTemplate.Modules = {};
export default BaseTemplate;