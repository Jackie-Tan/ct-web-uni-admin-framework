import link from './lib/link.js'

Template.p_projectlinkTableList.helpers({
  'linkTableConfig': function(){
    return BaseTemplate.of()._config.details.linkTable || []
  },
  'linkTable': function(){
    const tpl = Template.instance();
    return tpl.linkTable.get()[this.name];
  }
})

Template.p_projectlinkTableList.onCreated(function () {
  this.linkTable = new ReactiveVar([]);
  new link(BaseTemplate.of()._name, Router.current().params.id, this.linkTable);
})