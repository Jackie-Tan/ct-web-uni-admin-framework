
Template.datetimevnInput.onRendered(function(){
  let data = this.data;
  if (data.value) {
    let input = data.input;
    if (input.map)
      data.value = input.map(data.value)
    this.$('.datetimepickervn').datetimepicker({
      format: 'MM/DD/YYYY HH:mm:ss',
      defaultDate: new Date(this.data.value),
      timeZone: "+7"
    });
  }
  else {
    let format = 'MM/DD/YY 00:00:00'
    if (this.$('.datetimepickervn').attr('isEndOfDay') === "true") {
      format = 'MM/DD/YY 23:59:59'
    }
    this.$('.datetimepickervn').datetimepicker({
      format,
      timeZone: "+7"
    });
  }
})
