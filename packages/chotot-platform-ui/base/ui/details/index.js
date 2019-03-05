Template.baseDetailsPage.helpers({
  'displayClass': function () {
    return this.displayClass || 'col-md-4'
  },
  'name': function () {
    return BaseTemplate.of()._name;
  },
  'heads': function () {
    return BaseSchema.of().heads()
  },
  'data': function(){
    const tpl = Template.instance();
    return tpl.formData.get();
  },
  'isEditing': function(){
    return BaseSchema.of().get("isEditing")
  },
  'actions': function () {
    let details = BaseTemplate.of()._config.details
    return (details && details.actions) || []
  },
})
Template.baseDetailsPage.onCreated(function(){
  this.formData = new ReactiveVar();
  this.reload = new ReactiveVar();
  const self = this;
  const id = Router.current().params.id;
  const instance = BaseTemplate.of()
  if (!instance || !id){
    return;
  }
  this.autorun(function () {
    self.reload.get()
    Tracker.nonreactive(function () {
      instance.post("GetById", id, function(error, result){
        self.formData.set(result.rows[0]);
      })
    })
  })
})
Template.baseDetailsPage.onRendered(function(){
  let schema_id = this.$('.schema-bound').data('id');
  const instance = BaseTemplate.of()
  let details = instance._config.details;
  BaseSchema.of(schema_id).events(details && details.events, this)
})
