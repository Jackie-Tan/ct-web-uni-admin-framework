const MAP_LOG_LEVEL = {
  "INFO": 0,
  "ACTION": 1,
  "DEBUG": 2,
  "TRACE": 3,
}
var moment = require('moment-timezone');
const statClient = Npm.require('prom-client');
const buckets = [
  0.005, 0.01, 0.02, 0.04, 0.06, 0.08, 0.1, 0.15, 0.25, 0.4, 0.6, 0.8, 1, 1.5, 2, 3, 5
]
const statH = new statClient.Histogram(
  'request_duration_seconds',
  'The HTTP request latencies in seconds.',
  ['code','path'],
  {
    buckets: buckets
  }
)
var isNotLog = function (debugLevel) {
  let level = process.env.LOG_LEVEL;
  if (!level || typeof level != 'string')
    return true;
  return MAP_LOG_LEVEL[level.toUpperCase()] < MAP_LOG_LEVEL[debugLevel.toUpperCase()];

}
logger = {
  send: function(data) {
    console.log('xx')
  },
  action: function (action, ip, data, where) {
    if (isNotLog('action'))
      return
    let time = moment().tz("Asia/Ho_Chi_Minh").format("YYYY/MM/DD HH:mm:ss")
    let user = Meteor.user()
    let msgUser = user?`${ip} ${user.username || user.emails[0].address} ${user._id}`:"system.."
    let msgWhere = where? `[${where}]`:""
    console.log(`[${time}]${msgWhere} ${msgUser} ${action} with args`, JSON.stringify(data))
  },
  metrics: function() {
    return statClient.register.metrics();
  },
  stats: function (action, status, duration) {
    const APP_NAME = process.env.APP || 'non_register_admin';
    var path = `${APP_NAME}.${action}`;
    statH.labels(status, path).observe(duration/1000);
    logger.info(status, path, 'Duration_request:', duration, '_end_duration');
  },
  time: function (data) {
    let time = new Date().getTime()
    console.log(`${time} `)
  },
  info: function () {
    console.log.apply(null, arguments)
  },
  debug: function () {
    return isNotLog('debug') || console.log.apply(null, arguments)
  },
  trace: function () {
    return isNotLog('trace') || console.trace.apply(null, arguments)
  },
  error: function () {
    return console.error.apply(null, arguments)
  },
  warn: function () {
    return console.warn.apply(null, arguments)
  },
  bound: function (func, msg, errFunc) {
    try {
      func.call()
    } catch (e) {
      let newE = new Error(msg +' & '+ (e.message || e.reason));
      newE.stack = e.stack;
      if (!errFunc || typeof errFunc != 'function')
        throw newE;
      errFunc(newE)
    }
  }
}

Meteor.methods({
  'Global/Debug':function(level){
    level = ""+level;
    if (typeof MAP_LOG_LEVEL[level.toUpperCase()] == 'undefined') {
      logger.info('We do not have this log level')
      throw  new Meteor.Error('We do not have this log level!')
    }
    logger.info('Set log level to: ', level)
    process.env.LOG_LEVEL = level;
  }
})