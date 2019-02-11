
Template.registerHelper('formatTime', function(data){
  return moment(data).format('MM-DD-YYYY HH:mm:ss');
})
Template.registerHelper('formatDate', function(data){
  return moment(data).format('MM-DD-YYYY')
})

Template.registerHelper('cpDate', function(data){
  return moment(data).format('YYYY-MM-DD')
})
Template.registerHelper('cpTime', function(data){
  return moment(data).format('YYYY-MM-DD HH:mm')
})