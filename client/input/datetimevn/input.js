
Template.datetimevnInput.onRendered(function(){
  let data = this.data;
  if (data.value) {
    let input = data.input;
    if (input.map)
      data.value = input.map(data.value)
    this.$('.datetimepickervn').datetimepicker({
      format: 'MM/DD/YYYY HH:mm:ss.SSSSSS',
      defaultDate: new Date(this.data.value),
      timeZone: "+7"
    });
  }
  else {
    this.$('.datetimepickervn').datetimepicker();
  }
})
