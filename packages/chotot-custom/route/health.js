Router.route('/health', {where: 'server'}).get(function () {
  var request = this.request;
  var response = this.response;
  response.writeHead(200, {"Content-Type": "application/json"});
  response.end(JSON.stringify({ok: true, message: "I'm ok"}))
})
