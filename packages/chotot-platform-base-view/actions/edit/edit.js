Template.baseEditData.helpers({
  'getData': function(){
    return BaseTemplate.of().data.findById(this.id);
  }
})
Template.baseEditData.events({
  'submit form': function(e, tpl){
    e.preventDefault();
    let {edit} = BaseTemplate.of()._config.actions_config || {};
    edit = edit || {};
    let schema = BaseSchema.of();
    BaseTemplate.of().post("Update", [{id: tpl.data.id}, edit.isFull? schema.getLastData() : schema.getChangedData()], function () {
      BaseTemplate.of().reloadWithId(tpl.data.id);
    })
  }
})
