const Token = require('./token')
module.exports = {
  get: function (id) {
    if (process.env.CP_TOKEN_CONSISTENCE) {
      let tk = Token.of().findOne({id: id})
      return tk && tk.token || null
    }
    return Datas[id];
  },
  set: function (id, token) {
    if (!token)
      return;
    if (process.env.CP_TOKEN_CONSISTENCE) {
      return Token.of().upsert({id: id}, {id: id, token: token})
    }
    Datas[id] = token

  }
}


var Datas = {}