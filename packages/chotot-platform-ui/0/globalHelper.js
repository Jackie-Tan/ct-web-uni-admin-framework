
Template.registerHelper('formatTime', function(data){
  if (data) {
    return moment(data).format('MM-DD-YYYY HH:mm:ss')
  }
  return null;
})
Template.registerHelper('formatDate', function(data){
  if (data) {
    return moment(data).format('MM-DD-YYYY')
  }
  return null;
})

Template.registerHelper('cpDate', function(data){
  if (data) {
    return moment(data).format('YYYY-MM-DD')
  }
  return null;
})
Template.registerHelper('cpTime', function(data){
  if (data) {
    return moment(data).format('YYYY-MM-DD HH:mm')
  }
  return null;
})