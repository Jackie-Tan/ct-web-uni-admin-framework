module.exports = function (cmd, method, options = {}) {
    let url = `http://${process.env.CP_HOST}:${process.env.CP_PORT}/v1/${cmd}`
    // logger.debug(`${method} ${url}`)
    // logger.debug(options)
    options.timeout = 240000;
    return Meteor.wrapAsync(HTTP.call)(method, url, options);
  }