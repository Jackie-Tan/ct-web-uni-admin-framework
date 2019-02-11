/*
 List Value
 */

module.exports.listValueHelpers = {
  'isChecked': function () {
    //KEEP util change to "checked" helpers
    let inputIns = Template.instance()._inputIns;
    let value = inputIns.get();
    let listValue = typeof value != "undefined"? ("" + value).split(','): [];
    let $value =  typeof this.refValue != "undefined"?this.refValue:this.value
    if (typeof $value== 'object') {
      if ($value['$isNull'] && !listValue.length)
        return true;
      let nList = $value['$notInList'];
      if (nList) {
        for (let i of nList) {
          if (listValue.indexOf(""+i) != -1) {
            return false
          }
        }
      }
      return true
    }
    return listValue.indexOf(""+$value) != -1;
  },
  'checked': function() {
    let inputIns = Template.instance()._inputIns;
    let value = inputIns.get();
    let listValue = typeof value != "undefined"? ("" + value).split(','): [];
    let $value =  typeof this.refValue != "undefined"?this.refValue:this.value
    if (typeof $value== 'object') {
      if ($value['$isNull'] && !listValue.length)
        return {checked: true};
      let nList = $value['$notInList'];
      if (nList) {
        for (let i of nList) {
          if (listValue.indexOf(""+i) != -1) {
            return {checked: false}
          }
        }
      }
      return {checked: true}
    }
    return {checked: listValue.indexOf(""+$value) != -1};
  },
  'Ref': function(){
    if (typeof this.input.ref == 'function'){
      let tpl = Template.instance()
      return tpl.refData.get()
    }
    return this.input.ref || []
  },
  'refClass': function () {
    return this.refClass || Template.instance()._inputIns._input.refClass
  },
  "pKey": function () {
    return Template.instance()._inputIns._oConfig.key
  },
  "value": function () {
    return Template.instance()._inputIns.get()
  },
  'displayClass': function() {
    return Template.instance()._inputIns._input.displayClass || "col-xs-3"
  },
  'prefix': function () {
    return Template.instance().prefix || 'radio-list-1-';
  },
  'enable': function () {
    let input = Template.instance()._inputIns;
    if (typeof this.enable == 'function') {
      return this.enable.call(input)
    }
    return true;
  }
}
