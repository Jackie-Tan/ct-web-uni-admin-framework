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
            logger.graylogError(`Request Error: <path>${self.url}</path> <errorContent>${error}</errorContent>`);
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
          if (durationTime > 1000) {
            logger.graylogWarning(`Request Slow: <path>${self.url}</path> in <responseTime>${durationTime}</responseTime>, over 1000ms`);
          } else {
            logger.graylogInfo(`Request OK: <path>${self.url}</path> in <responseTime>${durationTime}</responseTime>`);
          }
          return resolve(data);
        }))

      })
    }
  }

  module.exports=Client
