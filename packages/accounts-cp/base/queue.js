const Fiber = require('fibers');
var QueueIns = {}
class Queue {
  constructor(user_id) {
    QueueIns[user_id] = this;
  }
  static of(user_id){
    if (QueueIns[user_id])
      return QueueIns[user_id]
    return new Queue(user_id)
  }
  release(){
     // logger.debug(`RELEASE NODE ${this._curr.cmd} in ${this._curr.time}`);
    let self = this;
    setTimeout(function () {
      self._curr = self._curr && self._curr._next;
      if (self._curr) {
           // logger.debug(`NEXT NODE ${self._curr.cmd} in ${self._curr.time}`)
          if (!self._curr.cb) {
             // logger.debug(`Lost cb ${self._curr.cmd} in ${self._curr.time}`)
            return
          }
          self._curr.cb(null, null);
      }
      else {
         // logger.debug(`END QUEUE!!`)
        self._last = null;
      }
    }, 0);
    return this;
  }
  curr() {
    // logger.debug('is have curr', this._curr)
    return this._curr
  }
  important(level){
    if (!this._last)
      return this;
    this._last._level = level;
    // logger.debug('last is', this._last)
    return this.clear(level);
    // level > 0 (clear all nodes which's level > the level)
    // !level mean it is not important
  }
  setNext(cmd, msg, data, opt) {
    let next = {
      cmd: cmd,
      msg: msg,
      data: data,
      time: new Date().getTime()
    };
    if (opt && typeof opt.level != 'undefined')
      this.important(opt.level);
    if (!this._last) {
       // logger.debug(`FIRST IN QUEUE ${next.cmd} in ${next.time}`)
      this._last = next;
      this._curr = this._last;
      return this;
    }
     // logger.debug(`ADD TO QUEUE ${next.cmd} in ${next.time}`)
    this._last._next = next;
    this._last = next;
    return this;
  }
  wait(cb){
     // logger.debug(`SET CB TO QUEUE ${this._last.cmd} in ${this._last.time}`)
    this._last.cb = cb
    this._last.fb = Fiber.current
  }
  clear(level){
    if (!this._curr._next)
      return this;
    this._last = this._curr;
    let self = this;
    let remove = function (object) {
      if (object._next) {
        if (object._next._level && object._next._level <= level) {
          self._last._next = object._next;
          self._last = object._next;
          remove(object._next);
          return
        }
         // logger.debug(`DELETE ${object._next.cmd} in ${object._next.time}`);
        let next = object._next;
        if (object._next.fb)
          object._next.fb.throwInto(new Error('it is not error, just clear this function from queue!'));
        else {
           // logger.debug(`LOST FB ${object._next.cmd} in ${object._next.time}`);
        }
        delete object._next;
        remove(next);

      }

    };
    // logger.debug('CLEAR QUEUE!')
    remove(this._last)
    // logger.debug(`END CLEAR QUEUE ${this._last.cmd} in ${this._last.time} is next ${!!this._last._next}`)
    return this;
  }
}

module.exports = Queue;