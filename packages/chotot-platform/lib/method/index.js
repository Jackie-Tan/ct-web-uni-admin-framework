import Postgres from 'meteor/chotot:postgres-simple-query';
import Model from '../model';

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function removeNull(obj){
  // logger.log(obj);
  for (let key in obj) {
    if (!obj[key] && obj[key] !== 0 && obj[key] !== false)
      delete obj[key];
  }
  return obj;
}

class Methods {
  constructor (name, config) {
    this.config = config;
    this.name = name;
    this.method = name;
    Methods.instances[name] = this;
    if (config.withTable !== false) {
      const self = this;
      const api = config.api_client;
      try {
        if (api) {
          let ApiClient = BaseTemplate.getCache('api');
          this.model = new ApiClient[config._context.md+'/'+api.name](config.api_env, {imports: {Postgres: Postgres}})
        }
        else {
          this.model = new Model(name, config);
        }
      } catch (err) {
        logger.warn('no using model!', this.name, err);
        return;

      }
      logger.info('init interface Get, Insert, Update, Import, Export', this.method);
      Meteor.methods({
        [this.method+'/Get']: (async function(settings){
          try {
            settings.user = Meteor.user();
            return await self.model.getDataForTable(settings);
          } catch (e){
            logger.trace(e);
            throw new Meteor.Error(e.message);
          }
        })
      })
      Meteor.secureMethods({
        [this.method+'/Count']: (async function(){
          try {
            return await self.model.count({});
          } catch (e){
            logger.trace(e);
            throw new Meteor.Error(e.message);
          }
        }),
        [this.method+'/GetById']: (async function(settings){
          try {
            return await self.model.getById(settings, {});
          } catch (e){
            logger.trace(e);
            throw new Meteor.Error(e.message);
          }
        }),
        [this.method+'/Insert']: (async function(data){
          try {
            return await self.model.insert(removeNull(data), {});
          } catch (e){
            logger.trace(e);
            throw new Meteor.Error(e.message);
          }
        }),
        [this.method+'/Update']: (async function(query, set){
          try {
            if (!Object.keys(set).length) {
              throw new Error('Nothing change!');
            }
            return await self.model.update({query: query, set: set}, {});
          } catch (e){
            logger.trace(e);
            throw new Meteor.Error(e.message);
          }
        }),
        [this.method+'/Import']: (async function(data){
          try {
            return await self.model.import(data, {});
          } catch (e){
            logger.trace(e);
            throw new Meteor.Error(e.message);
          }
        }),
        [this.method+'/Remove']: (async function(data){
          try {
            return await self.model.remove(data, {});
          } catch (e){
            logger.trace(e);
            throw new Meteor.Error(e.message);
          }
        })
      },{
        type: 'collection',
        collection: name
      })
    }
  }
  post(action) {
   let method = MethodList[this.method+'/'+action]
   logger.debug(`post action ${action} with method`, method)
   return method && method.apply(this, Array.prototype.slice.call(arguments, 1))
  }
  add(action, func, opt){
    logger.debug(`add action ${action} to template ${this.name}`)
    const method = {
      [this.method+'/'+action]: (async function(){
        try {
          return await func.apply(this, arguments);
        } catch (e){
          logger.trace(e);
          throw new Meteor.Error(e.message);
        }
      })
    }
    if (opt && opt.isSecure === false){
      return Meteor.methods(method);
    }
    Meteor.secureMethods(method,{
      type: 'action',
      action: `${this.name}.${action.toLowerCase()}`
    })
  }
  newModel(name, cfg) {
    cfg.db_env = this.config.db_env;
    cfg.tracking = {
      enable: false
    }
    cfg.baseSchema = [];
    cfg._context = this.config._context;
    return new Model(name, cfg)
  }
}

Methods.instances = {};

module.exports = Methods;
