import SpacebarBuilder from 'meteor/ctp:tools/spacebar';
Template.spacebarInput.onCreated(function(){
    let inputIns = this._inputIns = InputSchema.of();
    this._tName = SpacebarBuilder(BaseTemplate.of().name, inputIns._oConfig, inputIns._key);
     
})
Template.spacebarInput.helpers({
    'templateName': function(){
        return Template.instance()._tName;
    }
})