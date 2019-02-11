import Images from './lib/chotot-upload';
import parseCSV from './lib/papaparser';
const Data = require('./lib/data')
// _break_, _join_ is string function for array and json type

_ = require('./lib/lodash')

var GetData = {
  'isPending': false,
  'inForm': (tpl, opt, cb) => {
      var data = new Data({})
      let Find = tpl.$ || tpl.find
      Find.call(tpl, 'input,textarea,select,checkbox').not('[readonly]').map(function (index, el) {
        el = $(el);
        var name = el[0] && el[0].dataset && el[0].dataset.name || el.data('name');
        if (!name || name.trim() === "") return;
        var value = GetData.inInput(el);
        data.add(name, value);
      });
      if (cb) {
        //For backward
        return cb(null, data.exec())
      }
      return data.exec();
  },
  'inInput': (el) => {
    let val = el.val();
    switch (el.attr('type')) {
      case 'number':
        if (!el.attr('step'))
          return parseInt(el.val());
        return parseFloat(el.val());
      case "radio":
        if (Data.FUNC_LIST.indexOf(val) != -1)
          return val;
        if (el.prop('checked')) {
          if (val == 'on')
            return true;
          return val;
        }
        return null;
      case 'checkbox':
        if (Data.FUNC_LIST.indexOf(val) != -1)
          return val;
        if (el.prop('checked')) {
          if (val == 'on')
            return true;
          return val;
        }
        return false;
      case 'file':
        var files = el.prop("files");
        if (el.data('kind') === 'csv')
          return GetData.parseCSVPromise(el);
        if (el.data('kind') === "attachment")
          return Images.store(files, 'file');
        return Images.store(files, 'image');
      default:
        if (el.data('type') == 'date') {
          if (el.data('subtype') == 'text')
            return val
          const date = new Date(val);
          if (!date.getTime())
            return null;
          if (el.data('subtype') == 'number')
            return Math.round(date /1000);
          return date;
        }
        if (el.data('subtype') == 'number')
          return parseInt(val);
        if (typeof val == 'undefined') {
          throw new Error(`have problem in config at key ${el.data('name')}`)
        }
        return typeof val == "string" && val.trim() || val || "";
    }
  },
  'parseCSVPromise': (el) => {
    return new Promise((resolve, reject) => {
      GetData.parseCSV(el, function(result){
        resolve(result.data);
      })
    })
  },
  'parseCSV': (el,cb) => {
    if (el.attr('type')=='file' && el.data('kind') === "csv")
    {
      el.parse({
      	config: {
          header: true,
          complete: cb,
          skipEmptyLines: true
      	}
      });
    }
  },
  'unParseCSV': (data) => {
    return parseCSV.unparse(data);
  },
  'unParseCSVFile': (heads, data) => {
    const headKeys = [];
    if (!data.length) {
      data = [];
      let sample = {};
      for(let head of heads){
        sample[head.key] = 'input Data';
      }
      data.push(sample);
    }
    for(let head of heads){
      headKeys.push(head.key);
    }
    const csv = "data:text/csv;charset=utf-8,"+ GetData.unParseCSV(data.map(function(item) {
        return _.pick(item, headKeys);
      }));
    const encodedUri = encodeURI(csv);
    window.open(encodedUri);
  },
  'compare': function(a, b) {
    if (!a && a !== '' && a !== 0 && a !== false){
      a = null;
    }
    if (!b && b !== '' && b !== 0 && b !== false){
      b = null;
    }
    if ((a == null && b !== null) || (a != null && b == null))
      return b;
    if (a == null && b == null)
      return "_false_";
    if (typeof a == 'string' || typeof a == 'number' || typeof a == 'boolean'){
      if (a != b) {
        return b;
      }
      return "_false_";
    }
    if (a instanceof Date){
      if (Math.abs(a-b) > 10) {
        return b;
      }
      return "_false_";
    }
    if (!(a instanceof b.constructor)) {
      return b;
    }
    if (Array.isArray(a)) {
      const length = a.length
      if (length != b.length)
        return b;
      for(let i = 0; i < length; i++){
        if (GetData.compare(a[i], b[i]) !== "_false_"){
          return b;
        }
      }
      return "_false_";
    }
    for(key of _.union(Object.keys(a),Object.keys(b))){
      if (GetData.compare(a[key], b[key]) !== "_false_"){
        return b;
      }
    }
    return "_false_";
  },
  'checkDataChange': function(oldData, newData){
    let data = {};
    for (let key in newData){
      const value = GetData.compare(oldData[key], newData[key])
      if (value !== "_false_")
        data[key] = value;
    }
    return data;
  },
  'DataManagement': Data,
}
module.exports = GetData;
