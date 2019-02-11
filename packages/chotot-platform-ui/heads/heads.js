Template.baseHeads.onRendered(function () {
  this.parentData = Template.parentData();
  this.parentData.schema_id = Template.currentData().schema_id;
})
Template.baseHeads.helpers({
  'heads': function () {
    return BaseSchema.of().heads()
  },
  'data': function() {
    return this.data || this;
  },
  'opt': function() {
    return {displayClass: this.input.displayClass  || 'form-group col-md-12'};
  }
});
