Template.selectOptions.helpers({
  'isSelected': function(){
    const data = Template.parentData();
    return this.value == data.value;
  },
  'data': function(){
    if (Array.isArray(this.input.options))
      return this.input.options;
    return this.input.options[this.input.oRef]
  }
})
