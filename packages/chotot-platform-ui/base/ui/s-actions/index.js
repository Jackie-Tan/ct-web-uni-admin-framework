Template.schemaBtnAction.helpers({
    'key': function() {
        return Template.instance()._key;
    }
})
Template.schemaBtnAction.onCreated(function(){
    this._key = this.data.action.split('.')[1];
})