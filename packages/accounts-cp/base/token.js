class Token {
  constructor () {
    return new Mongo.Collection("token")
  }
  static of(){
    if (Ins) {
      return Ins;
    }
    Ins = new Token()
    return Ins
  }
}


var Ins = null

module.exports = Token