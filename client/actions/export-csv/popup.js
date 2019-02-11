import GetData from  'meteor/study:form-widget'


Template.baseExportCSVData.onCreated(function(){
  const name = this.view.name.split(".")[1];
  Session.set(name, null);
})
Template.baseExportCSVData.helpers({
  'heads': function(){
    return BaseTemplate.of().heads;
  }
})
Template.baseExportCSVData.events({
  'submit form': function(e, tpl){
    e.preventDefault();
    Session.set('isLoadingScreen', true);
    let listCol = [];
    tpl.$('input[name=col-check]:checked').map(function(){
      listCol.push({key: this.value});
    })
    if (!listCol.length){
      return dsLog.error('Please select cols for exporting!');
    }
    const instance = BaseTemplate.of();
    const method = instance.method+'/Get';
    const options = instance.tbOptions;
    options.useLimit = false;
    dsLog.info('[CALL] '+method);
    Meteor.call(method, options, function(error, result){
      Session.set('isLoadingScreen', false);
      if (error){
        dsLog.error(error.message);
        return;
      }
      tpl.$('.hide-modal').click();
      GetData.unParseCSVFile(listCol, result.data || []);
    })
  }
})
