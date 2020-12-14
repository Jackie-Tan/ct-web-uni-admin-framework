const { Readable } = require('stream');
const fetch = require('node-fetch');

const URL_UPLOAD = process.env.IRIS_URL || 'https://gateway.chotot.org/v1/internal/images/upload'

Router.route('/iris/image-upload', {where: 'server'}).post(function () {
  var request = this.request;
  var response = this.response;
  const readable = new Readable();
  readable._read = () => {};
  request
    .on('data', data => {
      readable.push(data);
    })
    .on('end', () => {
      readable.push(null);
      fetch(URL_UPLOAD, {
        body: {
          image: readable,
          type: 'admincentre'
        },
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
      console.log('end');
    });
});