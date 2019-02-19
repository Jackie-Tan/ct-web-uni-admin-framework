'use strict';
import Postgres from 'meteor/chotot:postgres-simple-query';
import baseSchema from './schema';
import bAutoValue from './autoValue';
import { check } from 'meteor/check';
const tbOptions = require('./options');
const run = require('async-run').run;


const MAX_LIMIT = 5000;
const LIMIT = 10;
const OFFSET = 0;
const DEFAULT_LIMIT = 1000;
const DEFAULT_OFFSET = 0;

const BASE_SHEMA = ['id', 'is_actived', 'is_deleted', 'updated_at', 'created_at', 'action'];
const JSON_SCHEMA = []
const MAP_TYPE = {
  'checkbox': Boolean,
  'number': Number,
  'object': Object
}
function mapType(type){
  let result = MAP_TYPE[type]
  if (result)
    return  result;
  return String;
}
function getType(input) {
  if (!input)
    return String
  if (input.subtype)
    return mapType(input.subtype)
  if (input.type)
    return mapType(input.type)
  return String

}
function convertToSchema(heads, baseSchema){
  let schema = {};
  heads.map(function(head){
    if (baseSchema.indexOf(head.key) != -1)
      return;
    let input = head.input;
    if (head.key.split('.').length > 1) // params schema
      return;
    schema[head.key] = {
      type: getType(input)
    };
    if (typeof head.autoValue != 'undefined') {
      logger.bound(() =>{
        const autoValue = head.autoValue;
        if (typeof autoValue == 'function')
        {
          schema[head.key].autoValue = autoValue
        }
        else {
          schema[head.key].autoValue = function(){
            if (typeof this.value === 'undefined' || this.value === null)
              return autoValue;
          }
        }
      }, 'autoValue config by define')

    } else if (input){
      logger.bound(() => {
        let type = input.subtype || input.type || 'text';
        const autoValue = bAutoValue[type] || bAutoValue[type.split('.')[0]];
        if (autoValue) {
          schema[head.key].autoValue = function () {
            this.input = input;
            return autoValue.call(this)
          }
        }
      }, 'type config with input')
    }
    if (input && input.options) {
      logger.bound(() => {
        schema[head.key].allowedValues = []
        input.options.map(function(option){
          schema[head.key].allowedValues.push(option.value);
        })
      }, 'allowValues config by options field')
    }
    logger.bound(() => {
      if (head.isOptional) {
        schema[head.key].optional = true;
      }
      if (head.notSearch) {
        schema[head.key].notSearch =  true;
      }
    }, 'optional, notSearch config')

  });
  return schema;
}

const addColumns= function(columns, schema){
  for (let key in schema){
    if (!schema[key].notSearch){
      columns.push(key);
      continue;
    }
    delete schema[key].notSearch;
  }
}

function getRole() {
  return Meteor.user().role_db
}

class BaseModel {

  constructor(name, config, track_table){
    let schema = this._raw_schema = convertToSchema(config.heads || [], config.baseSchema || BASE_SHEMA);
    this.config = config;
    logger.bound(() => {
      this.name = name
      this.table = config.table || name;
      this.tableView = config.tableView || this.table;
      this.isTrack = (config.tracking && config.tracking.enable !== false) || true;
      this.track_table = track_table || config.track_table || 'action_history';
      this.columns = [];
      if (typeof config.col_id == 'undefined') {
        this.columns.push('id');
      }
      addColumns(this.columns, schema);
      this.hookList = BaseTemplate.getCache('hook', config._context.name) || {}
      //----S Cols
      this._sCols = {
        role: "role"
      }
    },'init Structure Model')

    //----**------
    logger.bound(() => {
      let currentSchema = new SimpleSchema(schema);
      let currentBaseSchema = baseSchema;
      if (config.baseSchema)
        currentBaseSchema = baseSchema.pick(config.baseSchema);
      this.schema = new SimpleSchema([currentSchema, currentBaseSchema]);
      this.database_url = config.db || process.env[config.db_env] || process.env.DATABASE_URL;
      this.postgres = Postgres.of(this.database_url);
    }, 'init Database')

  }

  haveRole() {
    return this.columns.indexOf(this._sCols.role) != -1
  }
  extendRole(data) {
    let _role = getRole();
    if (this.haveRole()){
      if (!_role || !_role.length)
        _role = [0]
      data[this._sCols.role] = _role[0]
    }
  }
  extendCondition(condition, queryData ) {
    let _role = getRole();
    if (this.haveRole()) {
      if (!_role || !_role.length)
        _role = [-1]
      if (_role.indexOf(0) != -1) {
        return condition;
      }
      if (condition != '') {
        condition = `(${condition}) and ${this._sCols.role} IN( ${_role.join(',')} )`;
      } else {
        condition += `${this._sCols.role} IN( ${_role.join(',')} )`
      }
      queryData.concat(_role)
    }
    return condition
  }

  get(queryString, data){
    return this.postgres.get(queryString, data);

  }
  countByQuery(query, opt){
    return this.postgres.countByQuery(this.tableView || this.table, query, opt);
  }
  getByQuery(query, opt){
    return this.postgres.getByQuery(this.tableView || this.table, query, opt);
  }
  getDataForTable(options) {
    let self = this;
    return new Promise((resolve, reject) => {
      let opt = {
        limit: (options.limit && (options.limit > MAX_LIMIT)? MAX_LIMIT : options.limit) || LIMIT,
        offset: options.offset || OFFSET,
        useLimit: options.useLimit !== false,
        search: options.search || '',
        columnSearch: new tbOptions(options.columnSearch, "list", self.columns).get(),
        columnQuery: new tbOptions(options.columnQuery, "list", self.columns).get(),
        sort: new tbOptions(options.sort, "sort", self.columns).get(),
        user: options.user
      };
      if (!opt.useLimit){
        opt.limit = MAX_LIMIT
        opt.offset = DEFAULT_OFFSET
      }
      opt = self.getOptForSearch(opt);
      run(function *(){
        let res = {};
        try {
          //hook before insert
          yield self.hook('getDataForTable', 'before', {opt: opt});
          resQuery = yield self.postgres.getDataForTable(opt);
          res = {
            "recordsTotal": resQuery.lengthData,
            "recordsFiltered": resQuery.lengthData,
            "data": resQuery.data
          };
        } catch(error){
          return reject(error);
        }
        yield self.hook('getDataForTable', 'after', {res: res});
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    })

  }
  colID () {
    let col_id = this.config.col_id;
    if (typeof col_id =="string")
      return col_id;
    if (col_id && col_id.length)
      return col_id.join(',');
    return `id`
  }
  parseID(id) {
    if (Array.isArray(this.config.col_id)) {
      let id_sep = id.split(this.config.col_id.sep || '/');
      result = {};
      let self = this;
      id_sep.map(function(i, index){
        result[self.config.col_id[index]] = i;
      });
      return result;
    }
    return {id};
  }
  queryID(id) {
    if (!id) 
      return {end: Promise.reject(new Error("id is required!"))}
    let col_id = this.config.col_id;
    if (typeof col_id == "undefined") {
      return {conditionArr: 'id=$1', queryData: [id]};
    }
    if (!col_id) 
      return {end: Promise.resolve({})}
    if (typeof col_id == "string") {
      return {conditionArr: `${col_id}=$1`, queryData: [id]};
    }
    if (!col_id.length) {
      return {end: Promise.reject(new Error("unsupport col_id!"))}
    }
    let sep_id = id.split(this.config.col_id.sep || '/');
    if (col_id.length > sep_id.length)
      return {end: Promise.reject(new Error("id miss col"))}
    let conditionArr = col_id.map((c) => {return `${c}=$1`; }).join(' ');
    return {conditionArr, queryData: sep_id};
  }
  getById(id, opt){
    let{conditionArr, queryData, end} = this.queryID(id);
    if (end)
      return end;
    query = [`SELECT * FROM ${this.tableView}`];
    query.push(this.extendCondition(conditionArr, queryData));
    return this.get(query.join(' WHERE '), queryData);
  }
  getQueryDataTable(options){
    let limitQuery = '';
    let queryData = [];
    let condition = this.extendCondition('', queryData)
    queryData.push(options.limit);
    queryData.push(options.offset);
    limitQuery = `LIMIT $${queryData.length-1} OFFSET $${queryData.length}`;
    options.query = {
      text: `SELECT * FROM ${this.tableView}${condition? ` WHERE ${condition}`: ''} ORDER BY ${options.sort} ${limitQuery}`,
      data: queryData
    };
    options.count = {
      text: `SELECT COUNT(DISTINCT (${this.colID()})) FROM "${this.tableView}"${condition? ` WHERE ${condition}`: ''}`,
      data: []
    }
    return options;
  }
  getOptForSearch(options){
    let columns = this.columns || [];
    if (!columns.length)
    {
      logger.warn('wrong defination of columns in schema');
      return this.getQueryDataTable(options);
    }
    //TODO get params
    const columnSearch = options.columnSearch || [];
    const columnQuery = options.columnQuery || [];
    const searchText = options.search;
    //------
    if (!columnQuery.length && !columnSearch.length && searchText == '')
      return this.getQueryDataTable(options);
    let queryString = `${this.tableView} doc`;
    columns = columns.map(function(item){
      return `${item}`
    });
    if (searchText)
      queryString = `(SELECT *, concat(${columns.join(',')}) AS search  FROM "${this.tableView}") doc`
    let condition = '';
    let queryData = [];
    let selectData = '';
    //TODO special conditions
    if (searchText) {
      queryData.push(searchText);
      condition = 'LOWER(doc.search) ~ $1';
    }
    //--------
    if (columnSearch.length) {
      for (let i = 0; i < columnSearch.length; i++){
        let column = columnSearch[i];
        if (column.type == 'datetime'){
          let format = '::timestamp without time zone';
          if (column.subtype == 'number') {
            format = '';
          }
          if (column.min) {
            queryData.push(column.min);
            condition += ((condition != '')? ' and ' : '') + `doc.${column.key} >= $${queryData.length}${format}`;
          }
          if (column.max) {
            queryData.push(column.max);
            condition += ((condition != '')? ' and ' : '') + `doc.${column.key} <= $${queryData.length}${format}`;
          }
          continue;
        }
        if (!column.search || column.search == '')
          continue;
        if (column.type == 'exact') {
          queryData.push(column.search.toLowerCase? column.search.toLowerCase() : column.search) ;
          condition += ((condition != '')? ' and ' : '') + `doc.${column.key}  = $${queryData.length}`;
          continue;
        }
        queryData.push(column.search.toLowerCase());
        condition += ((condition != '')? ' and ' : '') + `LOWER(cast(doc.${column.key} as text)) ~ $${queryData.length}`;
      }
    } else {
      if (columnQuery.length) {
        for (let i = 0; i < columnQuery.length; i++){
          let column = columnQuery[i];
          if (column.type == 'datetime') {
            let format = '::timestamp without time zone';
            if (column.subtype == 'number') {
              format = ''
            }
            if (column.min) {
              queryData.push(column.min);
              condition += ((condition != '')? ' or ' : '') + `doc.${column.key} >= $${queryData.length}${format}`;
            }
            if (column.max) {
              queryData.push(column.max);
              condition += ((condition != '')? ' and ' : '') + `doc.${column.key} <= $${queryData.length}${format}`;
            }
            continue;
          }
          if (!column.search || column.search == '')
            continue;
          if (column.type == 'exact') {
            queryData.push(column.search.toLowerCase? column.search.toLowerCase() : column.search) ;
            condition += ((condition != '')? ' or ' : '') + `doc.${column.key}  = $${queryData.length}`;
            continue;
          }
          queryData.push(column.search.toLowerCase());
          condition += ((condition != '')? ' or ' : '') + `LOWER(cast(doc.${column.key} as text)) ~ $${queryData.length}`;
        }
      }
    }
    if (condition == '')
      return this.getQueryDataTable(options);
    condition = this.extendCondition(condition, queryData)
    let countData = [].concat(queryData);
    let limitQuery = '';
    queryData.push(options.limit);
    queryData.push(options.offset);
    limitQuery = `LIMIT $${queryData.length-1} OFFSET $${queryData.length}`;
    options.query = {
      text: `SELECT * FROM ${queryString} WHERE ${condition} ORDER BY ${options.sort} ${limitQuery}`,
      data: queryData
    }

    options.count = {
      text: `SELECT COUNT(DISTINCT ${this.colID()}) FROM ${queryString} WHERE ${condition}`,
      data: countData
    }
    return options;
  }
  track(type, oldData, newData){
    if (!this.isTrack)
      return;
    let trackData = {
      old: oldData?JSON.stringify(oldData):'null',
      new: JSON.stringify(newData),
      action_by: JSON.stringify({
        user_id: Meteor.userId(),
        email: Meteor.user().emails[0].address
      }),
      action_on: this.table,
      type: type
    };
    return this.postgres.insert(this.track_table, trackData).catch((e)=> {
      logger.error(e.message || e.reason)
    })
  }
  count(opt){
    let condition = '';
    let queryData = [];
    condition = this.extendCondition(condition, queryData)
    return this.postgres.count(this.tableView, {condition: condition, queryData: queryData});
  }
  hook(action, pos, params) {
    let self = this;
    return new Promise((resolve, reject) => {
      run(function *(){
        let hookAction = self.hookList[action];
        if (!hookAction)
          return resolve({});
        let list = hookAction[pos];
        if (!list)
          return resolve({});
        let length = list.length;
        for (let index = 0; index < length; index++) {
          let aPos = list[index];
          try {
            yield aPos.call({}, params)
            //Log for hook
            logger.debug(`hook for action ${action} at pos ${pos} in name ${self.name} and index ${index} is success`, params)
          } catch (e) {
            logger.info(`hook for action ${action} at pos ${pos} in name ${self.name} and index ${index} is error`, params)
            logger.error(e.message || e.reason)
            logger.trace(e);
            return reject(e)
          }
        }
        resolve({})
      }).catch((err) => {
        reject(err)
      });
    })
  }
  insert(data, opt = {}) {
    this.extendRole(data, opt);
    if (opt.isImport !== true)
      check(this.schema.clean(data, {filter: false}), this.schema);
    let self = this;
    return new Promise(function(resolve, reject) {
      run(function *(){
        try {
          //hook before insert
          yield self.hook('insert', 'before', {data: data, opt: opt});
          //extend role
          self.extendRole(data);
          opt.col_id = self.colID()
          var res = yield self.postgres.insert(self.table, data, opt);
        } catch(error){
          return reject(error)
        }
        try {
          if(!opt || opt.isImport !== true)
            self.track('insert', null, data)
        } catch(error){
          logger.error(error)
        }
        yield self.hook('insert', 'after', {res: res});
        resolve(res);
      }).catch((err) => {
        reject(err)
      });
    })
  }

  update(data, opt = {}){
    let list = Object.keys(data.set);
    list.push('updated_at');
    this.extendRole(data.query, opt);
    if (!opt || opt.isImport !== true) {
      let UpdateSchema = this.schema.pick(list);
      check(UpdateSchema.clean(data.set, {filter: false}), UpdateSchema);
    }
    let self = this;
    return new Promise(function(resolve, reject){
      const doFunc = (async function(){
        //TODO must show error unless querry id
        let raw_id = data.query.id;
        if (raw_id) {
          let raw_query = data.query;
          let parse_query = self.parseID(data.query.id);
          delete raw_query.id;
          data.query = _.extend(parse_query, raw_query);
        }
        try {
          var res = await self.postgres.update(self.table, data);
        } catch(error){
          return reject(error)
        }
        try {
          self.getById(raw_id, opt).then((oldData) => {
            self.track('update', oldData.rows.length?oldData.rows[0]:null, data)
          })
        } catch(error){
          logger.error(error);
        }
        resolve(res);
      });
      doFunc();
    })
  }

  remove(data){
    let self = this;
    this.extendRole(data);
    return new Promise(function(resolve, reject){
      const doFunc = (async function(){
        //TODO must show error unless querry id

        try {
          var res = await self.postgres.remove(self.table, data);
        } catch(error){
          return reject(error)
        }
        try {
          self.track('remove',data, null)
        } catch(error){
          logger.error(error);
        }
        resolve(res);
      });
      doFunc();
    })
  }
  import(data, opt){
    let self = this;
    return new Promise((resolve, reject) => {
      let errorList = [];
      let importFunc = (async function(){
        const length = data.length;
        let count = 0;
        for (let i = 0; i < length-1; i ++){
          let item = data[i];
          try {
            let id = item.id;
            check(self.schema.clean(item), self.schema);
            if (id && typeof id == "number")
              item.id = id;
          } catch (e) {
            count++;
            errorList.push({pos: [i+1], message: e.message});
            if (count >= 20){
              break;
            }
          }
        }
        if (errorList.length){
          return resolve({error: {type: 'validator', data: errorList }})
        }
        for (let i = 0; i < length; i ++){
          let item = data[i];
          try {
            if (item.id) {
              let id = item.id;
              delete item.id;
              await self.update({query: {id: id}, set: item}, {isImport: true})
            } else {
              await self.insert(item, {isImport: true});
            }
          } catch(e) {
            logger.error(e);
            errorList.push({pos: [i+1], message: e.message});
            let result = {error: {type: 'query', data: errorList }}
            self.track('import', null, result)
            return resolve(result)
          }
        }
      });
      importFunc();
    })
  }
}
module.exports = BaseModel;
