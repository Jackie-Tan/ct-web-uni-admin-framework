
Template.datetimeInput.onRendered(function(){
  let data = this.data;
  if (data.value) {
    let input = data.input;
    if (input.map)
      data.value = input.map(data.value)
    this.$('.datetimepicker').datetimepicker({
      format: 'MM/DD/YYYY HH:mm:ss.SSSSSS',
      defaultDate: new Date(this.data.value)
    });
  }
  else {
    this.$('.datetimepicker').datetimepicker();
  }
})
