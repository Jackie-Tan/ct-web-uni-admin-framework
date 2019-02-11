Template.registerHelper('parent', function(key){
    return Template.parentData()[key];
  })
  
Template.registerHelper('toString', function(key){
return ""+key;
})

Template.registerHelper('toJSON', function(data){
    try {
      return JSON.stringify(data)
    } catch (e){
      //console.log('html json parse failed',data)
      return data
    }
   })
Template.registerHelper("optionalAttr", function(data){
    if (!this.isOptional)
        return "required";
    return "";
})
Template.registerHelper("schema_key", function(data){
    let inputIns = Template.instance()._inputIns || {}
    return inputIns._key || ""
})
Template.registerHelper("schemaOpt", function(data){
    return {data: this};
})
Template.registerHelper("checkedByValue", function(data) {
    return {checked: !!this.value};
})

const INPUT_IN_CONTEXT_HAD_KEY = function() {
    if (!this.key) {
        return null;
    }
    let schema = BaseSchema.of() || InputSchema.of()._schema;
    return InputSchema.load(schema._id, this.key);
}
Template.registerHelper("inputRun", function(runKey) {
    let input = INPUT_IN_CONTEXT_HAD_KEY.call(this) || InputSchema.of();
    let runFunc = input._oConfig.run || {};
    return runFunc[runKey] && runFunc[runKey].call(input, this, Array.prototype.slice.call(arguments, 0)) || '';
})
Template.registerHelper("inputConf", function(key) {
    let input = INPUT_IN_CONTEXT_HAD_KEY.call(this) || InputSchema.of();
    return input && input._oConfig[key];
})