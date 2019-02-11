Template.baseAddData.events({
  'submit form': function(e){
    e.preventDefault();
    let schema = BaseSchema.of();
    BaseTemplate.of().post("Insert", schema.getLastData(), function () {
      BaseTemplate.of().reloadLastPage();
    })
    return false;
  }
})
