import GetData from  'meteor/study:form-widget'

Template.baseImportData.helpers({
  'displayClass': function(){
    if (this.input.displayClass)
      return this.input.displayClass;
    return 'col-md-12';
  },
  'importInput': function(){
    return {
      "key": "csv",
      "text": "CSV file",
      "input": {
        "type": "csv"
      }
    };
  }
})
Template.baseImportData.events({
  'submit form': function(e, tpl){
    e.preventDefault();
    Session.set('isLoadingScreen', true);
    let instance = BaseTemplate.of()
    GetData.parseCSV(tpl.$('input[type=file]'), function(result){
      const method = instance._method+'/Import';
      dsLog.info('[CALL] '+method);
      Meteor.call(method, result.data, function(error, result){
        Session.set('isLoadingScreen', false);
        if (error){
          dsLog.error(error.message);
          return;
        }
        if (result.error){
          dsLog.error('[CALL][IMPORT] '+result.error.type);
          result.error.data.map(function(err){
            dsLog.error(JSON.stringify(err));
          })
          dsLog.warning('end import!');
        } else {
          dsLog.success('update success!');
        }
        tpl.$('.hide-modal').click();
        instance.reloadLastPage();
      })
    });

  },
  'click .get-sample-csv': function (e, tpl) {
    e.preventDefault();
    const instance = BaseTemplate.of();
    instance.data.unParseToCSV(instance.heads);
  }
})
