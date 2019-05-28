function HTTP_CACHING(method, route, options) {
  const startTime = new Date().getTime();
  return new Promise((resolve, reject) => {
    let key = `Internal/${method}/${route}?${options.query || ''}`
    if (CachingData[key]) {
      return resolve(CachingData[key])
    }
    options.timeout = 10000;
    HTTP.call(method, route, options, function (err, data) {
      const durationTime = new Date().getTime() - startTime;
      if (err) {
        logger.graylogError(`${error}: --- ${route}`);
        return reject(err);
      }
      CachingData[key] = data;
      if (durationTime > 3000) {
        logger.graylogWarning(`Too slow when request ${route} in ${durationTime}, over 3000ms`);
      } else {
        logger.graylogInfo(`Request ${route} so ok in ${durationTime}`);
      }
      setTimeout(function () {
        CachingData[key] = null
      }, 10000)
      return resolve(data)
    })
  })
}
function HTTP_NO_CACHING(method, route, options) {
  const startTime = new Date().getTime();
  return new Promise((resolve, reject) => {
    options.timeout = 10000;
    HTTP.call(method, route, options, function (err, data) {
      if (err) {
        logger.graylogError(`${error}: --- ${route}`);
        return reject(err);
      }
      if (durationTime > 3000) {
        logger.graylogWarning(`Too slow when request ${route} in ${durationTime}, over 3000ms`);
      } else {
        logger.graylogInfo(`Request ${route} so ok in ${durationTime}`);
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
