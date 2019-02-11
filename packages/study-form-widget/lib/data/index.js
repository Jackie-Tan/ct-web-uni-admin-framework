const _ = require('../lodash')
function convertObjectToArray(resp) {
  let newResp = []
  for (let key in resp)
    newResp.push({[key]: resp[key]})
  return newResp
}
function acceptValue(value) {
  if (!value)
    return false
  if (Data.FUNC_LIST.indexOf(value) != -1)
    return false
  return true;
}
function createArray() {
  let resp = []
  for (let item of arguments) {
    resp.pushValidator(item)
  }
  return resp
}
Array.prototype.pushValidator = function(value) {
  if (!acceptValue(value))
    return
  this.push(value)
}
function initObject(resp, keys, value) {
  let length = keys.length;
  if (length == 0) {
    throw new Error('wtf')
  }
  if (length == 1) {
    if (typeof resp[keys[0]] == 'undefined') {
      if (value == '__end_next__')
        return resp[keys[0]] = []
      if (value == '__break__')
        return resp[keys[0]] = []
      return resp[keys[0]] = value
    }
    if (typeof resp[keys[0]] != 'object') {
      if (value == '__break__')
        return resp[keys[0]] = createArray(resp[keys[0]])
      if (value == '__join__')
        return
      return resp[keys[0]] = createArray(resp[keys[0]], value)
    }
    if (Array.isArray(resp[keys[0]])) {
      if (value == '__break__')
        return
      if (value == '__join__')
        return resp[keys[0]] = resp[keys[0]].join(",")
      if (value == '__next__') {
        return resp[keys[0]]._next = resp[keys[0]].length;
      }
      if (value == '__end_next__') {
        return delete resp[keys[0]]._next
      }
      return resp[keys[0]].pushValidator(value)
    }
    if (value == '__next__') {
      resp[keys[0]] = [resp[keys[0]]]
      return resp[keys[0]]._next = resp[keys[0]].length;
    }
    resp[keys[0]] = convertObjectToArray(resp[keys[0]])
    if (value == '__break__')
      return
    if (value == '__join__')
      throw Error(`cant join with the key`)
    return resp[keys[0]].pushValidator(value)
  }
  if (typeof resp[keys[0]] == 'undefined') {
    resp[keys[0]] = {}
    return initObject(resp[keys[0]], keys.slice(1), value)
  }
  if (typeof resp[keys[0]] != 'object') {
    let next = {}
    initObject(next, keys.slice(1), value)
    return resp[keys[0]] = [resp[keys[0]], next]
  }
  if (Array.isArray(resp[keys[0]])) {
    let nextIndex = resp[keys[0]]._next
    if (nextIndex) {
      if (!resp[keys[0]][nextIndex]) {
        let next = resp[keys[0]][nextIndex] = {}
        initObject(next, keys.slice(1), value)
        return
      }
      return initObject(resp[keys[0]][nextIndex], keys.slice(1), value)
    }
    let next = {}
    initObject(next, keys.slice(1), value)
    if (!acceptValue(value))
      return
    return resp[keys[0]].pushValidator(next)
  }
  return initObject(resp[keys[0]], keys.slice(1), value)
}

class Data {
  constructor() {
    this.__resp = {}
  }

  add(name, value) {
    if (value === null || (typeof value == "number" && isNaN(value)))
      return
    initObject(this.__resp, name.split('.'), value)
  }

  exec() {
    return this.__resp;
  }
}
Data.FUNC_LIST = ['__end_next__', '__break__', '__join__', '__next__']

module.exports = Data