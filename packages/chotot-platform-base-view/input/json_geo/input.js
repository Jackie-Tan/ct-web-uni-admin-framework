
// JSON
Template['json.geoInput'].helpers({
  'Ref': function(){
    return this.input.ref || ['x','y']
  },
  'key': function(){
    const data = Template.instance().data;
    return data.key+'.'+this;
  },
  'value': function(){
    const data = Template.parentData();
    if (data.value)
      return data.value[""+this];
  }
})
