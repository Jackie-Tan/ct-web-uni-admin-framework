Internal = {
  //CURRENT ONLY SUPPORT GET
  run: function (tag, options, cb) {
    if (options.loading) {
      Session.set('isLoadingScreen', true);
    }
    let args = Array.prototype.slice.call(arguments);
    if (!cb) {
      return new Promise((resolve, reject) => {
        let newCb = function (err, res) {
          if (err) {
            return reject(err);
          }
          resolve(res);
        }
        args.push(newCb);
        Internal.sent.apply(this, args)
      })
    }
    let resp = Internal.sent.apply(this, args)
    return resp
  },
  sent: function (tag, options, cb) {
    if (options.no_caching) {
      return baseWithoutCaching.apply(this, arguments)
    }
    return baseWithCaching.apply(this, arguments)
  }
}

var Caching = {}
const baseWithCaching = function (tag, options, cb) {
  let key = `${BaseTemplate.of()._name}/${tag}/{${options.add}?${options.query || ''}`
  if (Caching[key]) {
    return Caching[key].push(cb)
  }
  Caching[key] = [cb];
  return BaseTemplate.of().post(`Internal/${tag}`, options, {silent: true}, function (err, data) {
    Session.set('isLoadingScreen', false);
    Caching[key].map(function (aCb) {
      aCb(err, data)
    })
    Caching[key] = null;
  })

}
const baseWithoutCaching = function (tag, options, cb) {
  return BaseTemplate.of().post(`Internal/${tag}`, options, {silent: true, server_caching: false}, function (err, res) {
    Session.set('isLoadingScreen', false);
    cb(err, res);
  })

}