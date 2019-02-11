Template.baseSchema.onCreated(function () {
  //INIT
   this.nextData = Template.parentData() || Template.parentData(0)
   let {name, data, opt, schema_id} = this.data || {};
   if (typeof schema_id == 'undefined') {
    this._schema = this.data.schema = new BaseSchema(name || BaseTemplate.of()._name, data, opt);
    BaseTemplate.of().addSchema(this._schema);
   } else {
     this._schema = this.data.schema = BaseSchema.of(schema_id).clone(data);
   }
   //Publish schema_id
   this.nextData.schema_id = this.data.schema._id;
  
})
Template.baseSchema.helpers({
  'data': function () {
    return Template.instance()._schema.getData()
  },
  'schemaAttr': function () {
    let schemaAttr = this.schemaAttr || {}
    schemaAttr.class += ' schema-bound';
    schemaAttr['data-id'] = Template.instance().nextData.schema_id;
    return schemaAttr;
  }
})
Template.baseSchema.onDestroyed(function () {
  this._schema && this._schema.destroy()
})
