class SError {
  constructor() {
    this.data = {}
  }
  set(key, msg) {
    let ptr = this.data;
    let before = null;
    let list = key.split('.')
    let lvl = null;
    for (lvl of list) {
      if (!ptr[lvl]) {
        ptr[lvl] = {}
      }
      before = ptr
      ptr = ptr[lvl]
    }
    before[lvl] = msg;
  }
  remove(key){
   this.set(key, null)
  }
  get(key) {
    let list = key.split('.')
    let ptr = this.data;
    for (let lvl of list) {
      if (!ptr[lvl])
        return null
      ptr = ptr[lvl]
    }
    if (typeof ptr == 'string')
      return ptr
    let msg = []
    if (typeof ptr == 'object') {
      for (let key in ptr) {
        ptr[key] && msg.push(ptr[key])
      }
      return msg.join('<br>')
    }
    return null

  }
}
module.exports = SError