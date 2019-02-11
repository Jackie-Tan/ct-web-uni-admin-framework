import GetData from  'meteor/study:form-widget'
import UtilsData from 'meteor/chotot:platform-ui/base/utils/data';
class Data {
  constructor(data, options = {}){
    this.base_tpl = BaseTemplate.of();
    this.dataTable = data || {}
    this.data = this.dataTable.data || [];
    this.options = options;
    this.index = {}
    let length = this.data.length;
    for (let i = 0; i < length; i++){
      let item = this.data[i];
      this.index[UtilsData.getId(item)] = i;
    }
  }
  
  setUpdate(raw_id){
    this.updateRawId = raw_id;
  }
  setUpdateCount(func){
    this.updateCount = func;
  }
  replaceDataById(raw_id, item){
    this.data[this.index[raw_id]] = item;
  }
  replaceCount(count){
    this.dataTable.recordsTotal = count;
    this.dataTable.recordsFiltered = count;
  }
  getUpdateId(cb) {
    let raw_id = this.updateId;
    let self = this;
    BaseTemplate.of().post('GetById', raw_id, {slient: true}, function () {
      if (res && res.rows.length)
        self.replaceDataById(raw_id, res.rows[0]);
      cb(self.dataTable);
    })
    this.updateId = false;
  }
  getUpdateCount(cb) {
    let reload = this.updateCount;
    let self = this;
    BaseTemplate.of().post('Count', null, {slient: true}, function () {
      if (res && res.rows.length)
        self.replaceCount(parseInt(res.rows[0].count));
      cb(self.dataTable);
      setTimeout(function(){
        reload();
      },0)
    })
    this.updateCount = false;
  }
  get(cb){
    if (this.updateId) {
      return this.getUpdateId(cb);
    }
    if (this.updateCount) {
      return this.getUpdateCount(cb);
    }
    cb(this.dataTable);
  }
  findById(raw_id){
    return this.data[this.index[raw_id]];
  }
  checkOptionsChange(newOptions){
    if (!this.options)
      return true;
    for (let key in newOptions){
      if (newOptions[key] != this.options[key])
        return true;
    }
    return false;
  }
  unParseToCSV(heads){
    GetData.unParseCSVFile(heads, this.data);
  }
  unParseToCSVWithData(heads, data){
    GetData.unParseCSVFile(heads, data);
  }
}


export default Data;
