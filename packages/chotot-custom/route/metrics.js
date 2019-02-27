Router.route('/metrics', {where: 'server'}).get(function () {
  var request = this.request;
  var response = this.response;
  response.writeHead(200, {"Content-Type": "application/json"});
  response.end(logger.metrics())
})
