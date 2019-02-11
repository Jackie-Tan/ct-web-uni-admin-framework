function HTTP_CACHING(method, route, options) {
  return new Promise((resolve, reject) => {
    let key = `Internal/${method}/${route}?${options.query || ''}`
    if (CachingData[key]) {
      return resolve(CachingData[key])
    }
    HTTP.call(method, route, options, function (err, data) {
      if (err) {
        return reject(err);
      }
      CachingData[key] = data;
      setTimeout(function () {
        CachingData[key] = null
      }, 10000)
      return resolve(data)
    })
  })
}
function HTTP_NO_CACHING(method, route, options) {
  return new Promise((resolve, reject) => {
    HTTP.call(method, route, options, function (err, data) {
      if (err) {
        return reject(err);
      }
      return resolve(data)
    })
  })
}
IRequest = function(method, route, options = {}){
  logger.action("IRquest", "", {route, options})
  if (method == 'get' && options.server_caching !== false)
    return HTTP_CACHING(method, route, options)
  return HTTP_NO_CACHING(method, route, options)
}
//TODO caching call internal
var CachingData = {}
var InternalTags = {}
var BaseMethod = require('../method');
module.exports = {
  add: function (iRouteConfig, name) {
    logger.debug(`Register iRoute for collection ${name},  with config`, iRouteConfig)
    let {method, url, tag} = iRouteConfig;
    if (!method || !url || !tag) {
      logger.error(`method, url, tag is required in internal route config at template ${name}`, iRouteConfig)
      return
    }
    let internalTag = `Internal/${tag}`
    let cachingKey = name+'/'+internalTag;
    if (InternalTags[cachingKey]){
      logger.error(`tag ${tag} is exists in template ${name}`, iRouteConfig)
      return
    }
    InternalTags[cachingKey] = true;
    let methodIns = BaseMethod.instances[name];
    logger.debug('add Internal function', internalTag);
    methodIns && methodIns.add(
      internalTag, function(options = {}){
        try {
          let newUrl = url
          if (options.add)
            newUrl = url + '/'+options.add
          logger.debug(`${method} ${newUrl} with opt`, options)
          return IRequest(method, newUrl, options)
        } catch (e){
          throw new Meteor.Error(e.message);
        }
      });
  },
}