const fetch = require('node-fetch');

const URL_UPLOAD = process.env.IRIS_URL || 'https://gateway.chotot.org/v1/internal/images/upload'

Router.route('/iris/image-upload', {where: 'server'}).post(function () {
  var request = this.request;
  var response = this.response;
  let body = [];
  request
    .on('error', (err) => {
      console.error(err);
    })
    .on('data', data => {
      body.push(data);
    })
    .on('end', () => {
      body = Buffer.concat(body);  
      fetch(URL_UPLOAD, {
        body: body,
        headers: {
          "content-type": request.headers["content-type"],
          "content-length": request.headers["content-length"],
          "Tenant-Namespace": "chotot"
        },
        method: "POST",
      })
        .then((res) => res.json())
        .then((res) => {
          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify(res));
        })
        .catch((err) => {
          response.writeHead(400, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ error: err.message }));
        });
    });
});