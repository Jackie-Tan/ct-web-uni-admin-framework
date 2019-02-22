import UtilsData from 'meteor/chotot:platform-ui/base/utils/data';

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
Template.buttonAction.helpers({
  'getTemplate': function(){
    const btnArr = (""+this).split('.');
    const name = btnArr[0] + 'BtnAction';
    if (!Template[name])
       return 'defaultBtnAction';
    return  name;
  },
  'getData': function(){
    let data = Template.parentData();
    data.action = this;
    let id = UtilsData.getId(data);
    if (id) 
      data.id = id;
    return data;
  },
  'enable': function () {
    let name = (""+this)
    let instance = BaseTemplate.of();
    let user = Meteor.user();
    if (!user)
      return false;
    let user_role = user.role || []
    let cfg = instance._config.actions_config;
    cfg = cfg && cfg[name];
    if (!cfg || !cfg.role || user_role.indexOf(0) != -1)
      return true
    let user_ar = user.role_actions || []
    return user_ar.indexOf(`${instance._name}.${cfg.role}`) != -1;

  }
})

Template.defaultBtnAction.helpers({
  'Name': function(){
    return capitalizeFirstLetter(this.action);
  },
  'name': function(){
    return ""+this.action;
  }
})

Template.cellOutput.helpers({
  'getTemplate': function(){
    const {cellType} = this;
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
    return JSON.stringify(this.data);
  }
})


const getAction = function(context){
  if (!context.action)
    return 'data';
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
      return this.input.link.replace("{data}", this.data).replace("{current_route}", Router.current().url);
  }
})
