class Client {
    constructor(url, api_env) {
      if (Meteor.isClient) {
        this.api_url = "";
      } else {
        this.api_url = process.env[api_env] || process.env.GATEWAY_URL || 'https://gateway.chotot.org';
      }
      this.opt = {
        timeout: 10000
      };
      this.api_url = ("http://"+this.api_url).replace(/http[^s]*(s*)[^\/]\/\//, "http$1://");
      this.url = this.api_url + url;
    }

    static of(url, api_env){
      return new Client(url, api_env)
    }

    headers(headers) {
      this.opt.headers = headers;
      return this;
    }

    data(data){
      this.opt.data = data;
      return this;
    }

    exec(method, refactor) {
      const self = this;
      const startTime = new Date().getTime();
      return new Promise((resolve, reject) => {
        HTTP.call(method, self.url, self.opt, Meteor.bindEnvironment(function(error, result) {
          if (error) {
            console.log(JSON.stringify(self));
            console.warn(error);
            logger.graylogError(`${error}: --- ${self.url}`);
            reject(error);
          }
          let data = result.data || result;
          if (typeof refactor == 'function') {
            try {
              return resolve(refactor(data))
            } catch (error){
              console.log(JSON.stringify(self));
              console.trace(error);
              reject(error)
            }
          }
          const durationTime = new Date().getTime() - startTime;
          if (durationTime > 3000) {
            logger.graylogWarning(`Too slow when request ${self.url} in ${durationTime}, over 3000ms`);
          } else {
            logger.graylogInfo(`Request ${self.url} so ok in ${durationTime}`);
          }
          return resolve(data);
        }))

      })
    }
  }

  module.exports=Client
