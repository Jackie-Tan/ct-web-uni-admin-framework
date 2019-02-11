'use strict';
class ParseQuery{
  constructor(){
    this.count = 0;
    this.data = [];
  }

  convertGetQuery(obj){
    this.query = this.convertQueryBase(obj);
    return this;
  }
  convertInsert(obj) {
    let value = '';
    let name = '';
    let count = 0;
    for (let key in obj) {
      name += key + ',';
      value += `$${(++count)},`;
      this.data.push(obj[key]);
    }
    this.value = value.slice(0, -1);
    this.name = name.slice(0, -1);
    return this;
  };


  convertUpdate(obj){
    this.query = this.convertQueryBase(obj.query);
    this.set = this.convertUpdateBase(obj.set);
    return this;
  }

  convertUpdateBase(obj){
    let result = '';
    for(let key in obj){
      result += `${key}=($${++this.count}),`
      this.data.push(obj[key]);
    }
    return result.slice(0,-1);
  }

  convertRemove(obj){
    this.query = this.convertQueryBase(obj);
    return this;
  }

  convertQueryBase(obj){
    let result = '';
    for(let key in obj){
      if (obj[key] == "NULL") {
        result += `${key} IS NULL and `
        continue;
      }
      if (obj[key] == "IS NOT NULL") {
        result += `${key} IS NOT NULL and `
        continue;
      }
      result += `${key}=($${++this.count}) and `
      this.data.push(obj[key]);
    }
    return result.slice(0,-5);
  }
}

module.exports = ParseQuery
