// const Queue = require('./queue')
// const CPToken = require('./cp-token')
const CPRequest = require('./cp-request')
class TransClient {
  static of() {
    return new TransClient()
  }
  beforeSend(cmd, method, data, opt = {}) {
    let query = ""
    let queries = []
    this.time = new Date();
    if (cmd != 'admin/login') {
      let user = Meteor.users.findOne({_id: Meteor.userId()});
      if (!user.services || !user.services.cp) {
        throw new Meteor.Error('Bạn không có quyền truy cập CP')
      }
      this.user_tran_id = user.services.cp.id;
      if (!opt.no_token)
      this.token = data.token = user.services.cp.token;
      if (!data.remote_addr)
        data.remote_addr = '127.0.0.1'
        data.reviewer_name = user.username
    }
    if (method == 'GET') {
      for (let key in data) {
        queries.push(`${key}=${data[key]}`)
      }
      query = queries.join('&')
      data = {}
    }
    return {data, query}
  }

  send(cmd, method, body, opt) {
    //IS EMPTY QUEUE RUN ONE CORE
    let startTime = new Date()
    logger.debug('run message ',arguments)
    let options = this.beforeSend(cmd, method, body, opt)
    try {
      let resp = CPRequest(cmd, method, options)
      this.afterSend(cmd, method, body, resp.data, opt);
      let duration = new Date()-startTime;
      logger.action(cmd, "", {method, options, result: "success", waiting_send_tran: duration, startTime: startTime}, "cp")
      return resp.data
    } catch (e) {
      logger.debug('error trans', e);
      let respErr =  e.response && e.response.data || {}
      logger.action(cmd, "", {method, options, error: respErr}, "cp")
      this.afterSend(cmd, method, body, respErr, opt);
      let statusSTD = "500"
      logger.debug('resp Err', respErr);
      let message = respErr.message || ""
      if (message.indexOf("pq: ERROR_INVALID_STATE IN UNLOCK:") != -1) {
        statusSTD = "204"
        return {warning: `Ad đã được ${message.replace("pq: ERROR_INVALID_STATE IN UNLOCK:", "")}!`}
      }
      if (message.indexOf("ERROR_TOKEN_OLD") != -1) {
        statusSTD = "403"
        Meteor.call('Global/Users/forceLogout');
      }
      let err = new Meteor.Error(message || e.message || e.reason);
      err.statusCode = statusSTD;
      throw err;
    }
  }
  afterSend(cmd, method, body, resp, opt = {}){
    logger.debug(`RESPONSE TIME for cmd: ${cmd} status: ${resp instanceof Error ? 'ERROR': 'SUCCESS' }`, new Date()-this.time);
    Meteor.users.update({_id: Meteor.userId()}, {$set: {'services.cp.cp_time': new Date()/1000}});
    // if (resp && resp.token != this.token) {
    //   CPToken.set(this.user_tran_id, resp.token);
    // }
    // logger.debug()
    // QUEUE MANAGE, REMOVED FOR SAME TOKEN
    // Queue.of(Meteor.userId()).release()
    // if (opt.no_token) {
    //   return
    // }
    // if (cmd != 'admin/login') {
    //   if (!resp.token){
        // logger.debug("tai sao zo day", arguments)
        // logger.debug("LOST TOKEN")
        // Meteor.call('Global/Users/forceLogout');
        // throw new Meteor.Error("YOUR TOKEN IS OLD!");
        // return
      // }
      // logger.debug('new token', resp.token)
      // CPToken.set(this.user_tran_id, resp.token);
    // }
  }
}

module.exports = TransClient