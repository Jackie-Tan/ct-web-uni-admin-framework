
BaseMethodIns = {}
class baseMethod {
  constructor(template_name) {
    this._name = template_name;
    BaseMethodIns[template_name] = this;
  }
  static of(template_name){
    return BaseMethodIns[template_name] || new baseMethod(template_name)
  }
  success(action) {
    return `${action} thành công!`
  }
  oMethod(action) {
    if (this._name == 'global')
      return "Global/"+action;
    return BaseTemplate.of(this._name)._method+ '/' + action;
  }
  retryConnect(next, num) {
    if (num == 3) {
      return next(new Error("Lost connection!"));
    }
    if (!Meteor.status().connected) {
      Meteor.reconnect()
      return setTimeout(() => {
        this.retryConnect(next, num+1)
      }, 100)
    }
    return next()
  }
  beforePost(action, opt = {}) {
    //check connection status

    //---end check connection
    let {silent, no_popup, success} = opt
    dsLog.info('[CALL] '+this._method);
    dsLog.race(`[method]${action}`);
    !silent && Session.set('isLoadingScreen', true);
  }
  endPost(action, error, result, opt = {}, cb) {
    let {silent, no_popup, success} = opt
    dsLog.race(`[method]${action}`)
    !silent && Session.set('isLoadingScreen', false);
    if (error){
      !silent && dsLog.error(error.msg());
      if (cb)
        return cb(error, null)
      return;
    }
    !silent && $('.hide-modal').click();
    !silent && !no_popup && dsLog.success(success || this.success(action), { timeOut: 888 });
    if (cb)
      return cb(null, result)
  }
  post(action, args, opt, cb) {
    let self = this;
    Tracker.nonreactive(function(){
      if (!cb) {
        if (typeof opt == 'function') {
          cb = opt
          opt = {};
        }
      }
      self.retryConnect((err) => {
        if (err) {
          return cb(err)
        }
        self.beforePost(action, opt);
        if (!Array.isArray(args))
          args = [args]
        Meteor.apply(self.oMethod(action), args, function(error, result){
          self.endPost(action, error, result, opt, cb)
        });
      }, 0);
    });
  }

}

BaseMethod = baseMethod