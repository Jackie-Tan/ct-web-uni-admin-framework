'use strict';
import pg from 'pg';

const ParseQuery = require('./lib/ParseQuery');

const convertURL = function(url){
  let config = {}
  try {
    const info = url.split('//')[1];
    const infoParse = info.split('@');
    const userInfo = infoParse[0];
    const hostInfo = infoParse[1];
    const userInfoParse = userInfo.split(':');
    config.user = userInfoParse[0];
    config.password = userInfoParse[1] || '';
    const hostInfoParse = hostInfo.split('/');
    const host = hostInfoParse[0];
    const hostParse = host.split(':');
    config.host = hostParse[0];
    config.port = parseInt(hostParse[1]) || 5432;
    config.database = hostInfoParse[1];
    return config
  } catch (e) {
    throw new Error('not right postgres db format')
  }
}
class Postgres {

  constructor(database_url){
    if (!Postgres.instances)
      Postgres.instances = {};
    Postgres.instances[database_url] = this;
    this.database_url = database_url;
    let config = convertURL(database_url);
    logger.debug(database_url);
    logger.debug(config);
    config.max = 300;
    config.idleTimeoutMillis = 30000;
    this.pool = new pg.Pool(config);
    this.pool.on('error', function (err, client) {
      logger.error('idle client error', err.message, err.stack)
    })
  }

  deConstructor(done){
    if (done){
      done();
    }
  }

  static of(database_url){

    if (Postgres.instances && Postgres.instances[database_url])
      return Postgres.instances[database_url];
    return new Postgres(database_url)
  }


  connect(database_url, cb){
    const self = this;
    this.pool.connect((err, client, done) => {
      // Handle connection errors
      if(err) {
        self.deConstructor(done);
        logger.error(database_url, err.message || err.reason);
        cb({
          query(queryString, queryData, cb) {
            cb(new Error('failed to connect db',  err.message || err.reason));
          },
        });
        return;
      }
      self.client = client;
      self.done = done;
      cb(client);
    });
  }
  getClient(cb) {
    if (this.client)
      return cb(this.client);
    this.connect(this.database_url, cb);
  }
  getID(opt) {
    return opt.col_id || "id";
  }
  insert(table, data, opt = {}){
    const self = this;
    return new Promise((resolve, reject) => {
      const parseData = new ParseQuery().convertInsert(data);
      const queryString = `INSERT INTO "${table}"(${parseData.name}) values(${parseData.value}) ${(opt && opt.notReturnId)?'':`RETURNING ${self.getID(opt)}`}`;
      logger.debug(parseData);
      logger.debug(queryString);
      self.getClient(function(client) {
        const startTime = new Date();
        client.query(queryString,
          parseData.data, function (error, result) {
            const durationTime = new Date() - startTime;
            if (error){
              logger.error(queryString);
              logger.graylogError(`Postgres Error: <query>${queryString}</query> <errorContent>${error}</errorContent> with <responseTime>${durationTime}</responseTime>`);
              reject(error);
            }
            if (durationTime > parseInt(process.env.POSTGRES_SLOW_TIME, 10)) {
              logger.graylogWarning(`Postgres Slow: <query>${queryString}</query> in <responseTime>${durationTime}</responseTime>, over ${parseInt(process.env.POSTGRES_SLOW_TIME, 10)}ms`);
            } else {
              logger.graylogInfo(`Postgres OK: <query>${queryString}</query> in <responseTime>${durationTime}</responseTime>`);
            }
            logger.trace(result);
            resolve(result);
        });
      })


    })

  }
  update(table, data){
    const self = this;
    return new Promise((resolve, reject) => {
      let parseData = new ParseQuery().convertUpdate(data);
      if (parseData.set =='')
        return resolve({});
      const queryString = `UPDATE "${table}" SET ${parseData.set} WHERE ${parseData.query}`;
      logger.debug(parseData);
      logger.debug(queryString);
      self.getClient(function(client) {
        const startTime = new Date();
        client.query(queryString,
        parseData.data, function (error, result) {
          const durationTime = new Date() - startTime;
          if (error) {
            logger.error(queryString);
            logger.graylogError(`Postgres Error: <query>${queryString}</query> <errorContent>${error}</errorContent> with <responseTime>${durationTime}</responseTime>`);
            reject(error);
          }
          if (durationTime > parseInt(process.env.POSTGRES_SLOW_TIME, 10)) {
            logger.graylogWarning(`Postgres Slow: <query>${queryString}</query> in <responseTime>${durationTime}</responseTime>, over ${parseInt(process.env.POSTGRES_SLOW_TIME, 10)}ms`);
          } else {
            logger.graylogInfo(`Postgres OK: <query>${queryString}</query> in <responseTime>${durationTime}</responseTime>`);
          }
          logger.trace(result)
          resolve(result);
        });
      });
    });
  }
  remove(table, data){
    const self = this;
    return new Promise((resolve, reject) => {
      let parseData = new ParseQuery().convertRemove(data);
      if (parseData.query =='')
        return resolve({});
      const queryString = `DELETE FROM "${table}" WHERE ${parseData.query}`;
      logger.debug(parseData);
      logger.debug(queryString);
      self.getClient(function(client) {
        const startTime = new Date();
        client.query(queryString,
        parseData.data, function (error, result) {
          const durationTime = new Date() - startTime;
          if (error) {
            logger.error(queryString);
            logger.graylogError(`Postgres Error: <query>${queryString}</query> <errorContent>${error}</errorContent> with <responseTime>${durationTime}</responseTime>`);
            reject(error);
          }
          if (durationTime > parseInt(process.env.POSTGRES_SLOW_TIME, 10)) {
            logger.graylogWarning(`Postgres Slow: <query>${queryString}</query> in <responseTime>${durationTime}</responseTime>, over ${parseInt(process.env.POSTGRES_SLOW_TIME, 10)}ms`);
          } else {
            logger.graylogInfo(`Postgres OK: <query>${queryString}</query> in <responseTime>${durationTime}</responseTime>`);
          }
          logger.trace(result)
          resolve(result);
        });
      });
    });
  }
  removeAllData(table){
    const self = this;
    return new Promise((resolve, reject) => {
      const queryString = `DELETE FROM "${table}"`;
      logger.debug(queryString);
      self.getClient(function(client) {
        const startTime = new Date();
        client.query(queryString,
        {}, function (error, result) {
          const durationTime = new Date() - startTime;
          if (error) {
            logger.error(queryString);
            logger.graylogError(`Postgres Error: <query>${queryString}</query> <errorContent>${error}</errorContent> with <responseTime>${durationTime}</responseTime>`);
            reject(error);
          }
          if (durationTime > parseInt(process.env.POSTGRES_SLOW_TIME, 10)) {
            logger.graylogWarning(`Postgres Slow: <query>${queryString}</query> in <responseTime>${durationTime}</responseTime>, over ${parseInt(process.env.POSTGRES_SLOW_TIME, 10)}ms`);
          } else {
            logger.graylogInfo(`Postgres OK: <query>${queryString}</query> in <responseTime>${durationTime}</responseTime>`);
          }
          logger.trace(result)
          resolve(result);
        });
      });
    });
  }
  get(queryString, data){
    const self = this;
    return new Promise((resolve, reject) => {
      if (!data)
        data = [];
      logger.debug(queryString);
      self.getClient(function(client) {
        client.query(queryString, data, function (error, result) {
          if (error) {
            logger.error(queryString);
            reject(error);
          }
          logger.trace(result)
          resolve(result);

        });
      })
    });
  }

  getByQuery(table, query, opt){
    const self = this;
    if (!opt)
      opt = {}
    return new Promise((resolve, reject) => {
      let parseData = new ParseQuery().convertGetQuery(query);
      if (parseData.query =='')
        return resolve({});
      //LIMIT OFFSET
      parseData.data.push(opt.limit || 100)
      parseData.data.push(opt.offset || 0)
      let length = parseData.data.length;
      //
      const queryString = `SELECT * FROM "${table}" WHERE ${parseData.query} LIMIT $${length-1} OFFSET $${length}`;
      logger.debug(parseData);
      logger.debug(queryString);
      self.getClient(function(client) {
        const startTime = new Date();
        client.query(queryString, parseData.data, function (error, result) {
          const durationTime = new Date() - startTime;
          if (error) {
            logger.error(queryString);
            logger.graylogError(`Postgres Error: <query>${queryString}</query> <errorContent>${error}</errorContent> with <responseTime>${durationTime}</responseTime>`);
            reject(error);
          }
          if (durationTime > parseInt(process.env.POSTGRES_SLOW_TIME, 10)) {
            logger.graylogWarning(`Postgres Slow: <query>${queryString}</query> in <responseTime>${durationTime}</responseTime>, over ${parseInt(process.env.POSTGRES_SLOW_TIME, 10)}ms`);
          } else {
            logger.graylogInfo(`Postgres OK: <query>${queryString}</query> in <responseTime>${durationTime}</responseTime>`);
          }
          logger.trace(result)
          resolve(result);

        });
      });
    });
  }

  countByQuery(table, query, opt = {}){
    const self = this;
    return new Promise((resolve, reject) => {
        let parseData = new ParseQuery().convertGetQuery(query);
        if (parseData.query =='')
          return resolve({});
        const queryString = `SELECT COUNT(DISTINCT ${self.getID(opt)}) FROM "${table}" WHERE ${parseData.query}`;
        logger.debug(parseData);
        logger.debug(queryString);
        self.getClient(function(client) {
          const startTime = new Date();
          client.query(queryString, parseData.data, function (error, result) {
            const durationTime = new Date() - startTime;
            if (error) {
              logger.error(queryString);
              logger.graylogError(`Postgres Error: <query>${queryString}</query> <errorContent>${error}</errorContent> with <responseTime>${durationTime}</responseTime>`);
              reject(error);
            }
            if (durationTime > parseInt(process.env.POSTGRES_SLOW_TIME, 10)) {
              logger.graylogWarning(`Postgres Slow: <query>${queryString}</query> in <responseTime>${durationTime}</responseTime>, over ${parseInt(process.env.POSTGRES_SLOW_TIME, 10)}ms`);
            } else {
              logger.graylogInfo(`Postgres OK: <query>${queryString}</query> in <responseTime>${durationTime}</responseTime>`);
            }
            logger.trace(result)
            resolve(result);
          });
        })
    });
  }

  count(table, opt){
    if (opt) {
      let condition = opt.condition || '';
      return this.get(`SELECT COUNT(DISTINCT (${this.getID(opt)})) FROM ${table}${condition
        ? ' WHERE ' + condition
        : ''}`, opt.queryData);
    }
    return this.get(`SELECT COUNT(DISTINCT (${this.getID(opt)})) FROM ${table}`);
  }
  getDataForTable(options){
    const startTime = new Date();
    return new Promise((resolve, reject) => {
      const self = this;
      let get = async function () {
        try {
          const data = await self.get(options.query.text, options.query.data);
          const total = await self.get(options.count.text, options.count.data);
          const lengthData = total.rows.length? parseInt(total.rows[0].count): 0;
          const durationTime = new Date() - startTime;
          if (durationTime > parseInt(process.env.POSTGRES_SLOW_TIME, 10)) {
            logger.graylogWarning(`Postgres Slow: <query>${options.query.text}</query> in <responseTime>${durationTime}</responseTime>, over ${parseInt(process.env.POSTGRES_SLOW_TIME, 10)}ms`);
          } else {
            logger.graylogInfo(`Postgres OK: <query>${options.query.text}</query> in <responseTime>${durationTime}</responseTime>`);
          }
          resolve({
            lengthData: lengthData,
            data: data.rows
          });
        } catch (e){
          const durationTime = new Date() - startTime;
          logger.error(e);
          logger.graylogError(`Postgres Error: <query>${options.query.text}</query> <errorContent>${e}</errorContent> with <responseTime>${durationTime}</responseTime>`);
          reject(e);
        }
      };
      get();
    })

  }

  bulkInsert(table, rows, opt = {}){
    const self = this;
    return new Promise((resolve, reject) => {
      const keys = Object.keys(rows[0]);
      const values = rows.map(rowData => {
        const row = [];
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          let colValue = typeof rowData[key] !== 'undefined' ? rowData[key] : null;
          if (typeof colValue === 'string') {
            colValue = `'${colValue.replace("'", "''")}'`;
          }
          row.push(colValue);
        }
        return `(${row.join(', ')})`;
      }).join(', ');
      const queryString = `INSERT INTO "${table}"(${keys.join(', ')}) values${values} ${(opt && opt.notReturnId)?'':`RETURNING ${self.getID(opt)}`}`;
      logger.debug(queryString);
      self.getClient(function(client) {
        const startTime = new Date();
        client.query(queryString, [], function (error, result) {
          const durationTime = new Date() - startTime;
          if (error){
            logger.error(queryString);
            logger.graylogError(`Postgres Error: <query>${queryString}</query> <errorContent>${error}</errorContent> with <responseTime>${durationTime}</responseTime>`);
            reject(error);
          }
          if (durationTime > parseInt(process.env.POSTGRES_SLOW_TIME, 10)) {
            logger.graylogWarning(`Postgres Slow: <query>${queryString}</query> in <responseTime>${durationTime}</responseTime>, over ${parseInt(process.env.POSTGRES_SLOW_TIME, 10)}ms`);
          } else {
            logger.graylogInfo(`Postgres OK: <query>${queryString}</query> in <responseTime>${durationTime}</responseTime>`);
          }
          logger.trace(result);
          resolve(result);
        });
      });
    });
  }
}

module.exports = Postgres;
