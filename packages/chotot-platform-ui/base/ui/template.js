function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getTemplate(data) {
  if (data.withTable)
  return 'BaseTemplateProject';
  let name = data.name+'Custom';
  if (!Template[name])
    return 'baseTemplateCustom';
  return name;
}
Template.baseTemplate.onCreated(function(){
  let data = Template.parentData()
  this._tplName = getTemplate(data || this.data)
  this.comp = this.autorun(function(){
    if (!Meteor.user() || Accounts._loggingIn.get()) {
      Router.go('/signin')
    }
  })
})
Template.baseTemplate.onDestroyed(function () {
  this.comp.stop();
  BaseTemplate.of().clearSchema();
  BaseTemplate.of().clearDependency();
})

Template.baseTemplate.helpers({
  'data': function () {
     return Template.parentData()
  },
  'getTemplate': function(){
    return Template.instance()._tplName;
  }
})
Template.baseTemplate.events({
  'click .btn-action': function (e, tpl) {
    BaseTemplate.of().doAction(e, tpl)
  }
})
Template.BaseTemplateProject.helpers({
  'toString': function(value){
    return (value?'true':'false');
  },
  'IdTable': function(){
    return capitalizeFirstLetter(this.name)+'TableId';
  },
  'Name': function(){
    let nameArr = this.display.split('_');
    return nameArr.map(capitalizeFirstLetter).join(' ');
  },
  'heads': function(){
    return this.heads;
  },
  'actionTemplate': function(){
    return `base${this}Data`;
  },
  'actionData': function () {
    return Template.parentData();
  },
  'actionButtons': function(){
    return BaseTemplate.of()._config.actions;
  },
  'action': function(){
    return capitalizeFirstLetter(this);
  },
  'dtConfig': function() {
    const datatableConfig = BaseTemplate.of()._config.datatable || {};
    let cls = [];
    const {bigSearch} = datatableConfig;
    if (bigSearch === false) {
      cls.push("hideBigSearch");
    }
    return cls.join(" ");
  }
});

Template.BaseTemplateProject.events({
  'mouseenter td': function(e, tpl) {
    let el = e.currentTarget;
    $(el).attr('title', el.innerText);
  }
});

Template.baseActionLog.helpers({
  'LogData': function(){
    Session.get('LogActionChange');
    return LogBySession;
  }
})

Template.baseTemplateCustom.helpers({
  'key': function(){
    return Template.instance().data.key || "base"
  }
})