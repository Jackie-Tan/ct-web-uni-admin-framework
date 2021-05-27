Template.cellOutput.onCreated(function(){
  this.cellType = false;
  let {input} = this.data;
  let cellType = input.cell || input.type;
  if (cellType != 'text' && input.cell !== false) {
    this.cellType = cellType;
  }
})
Template.cellOutput.helpers({
  'cellType': function() {
    const {cellType} = Template.instance();
    return cellType;
  },
  'getTemplate': function(){
    const {cellType} = Template.instance();
    const name = cellType + 'CellOutput';
    if (Template[name])
      return name;
    const defaultName = ("text"|| cellType).split('.')[0]+'CellOutput';
    if (Template[defaultName])
      return defaultName;
    return 'textCellOutput';
  },
})

Template.jsonCellOutput.helpers({
  'parseData': function(){
    return JSON.stringify(this.value);
  }
})

Template.logoCellOutput.helpers({
  'height': function(){
    const {input = {}} = this;
    return input.height || 40
  }
})

Template.fileTemplateCellOutput.helpers({
  'title': function() {
    if (this.value) {
      const valueArr = this.value.split('/');
      const fileName = valueArr[valueArr.length - 1];
      if (fileName.length > 13) {
        return fileName.substring(13, fileName.length);
      }
      return fileName;
    }
    return '';
  }
});

const getAction = function(context){
  if (!context.action)
    return 'value';
  const actionArr = context.action.split('.');
  const action = actionArr.length> 1? actionArr[1]: context.action;
  return action;
}
Template.checkboxCellOutput.helpers({
  'toString': function(value){
    return ""+ value
  },
  'isTrue': function(){
    const value = this[getAction(this)];
    return value == 'true' || value === true;
  },
  'key': function () {
    return this.action;
  }
})

Template.linkCellOutput.helpers({
  'getLink': function(){
    if (this.input.link)
      return this.input.link.replace("{data}", this.value).replace("{current_route}", Router.current().url);
  }
})
