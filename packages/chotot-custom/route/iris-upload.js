const { Uploader } = require('ct-iris-client');
const Request = require('request');
const { Readable } = "stream";

const URL_UPLOAD = process.env.IRIS_URL || 'https://gateway.chotot.org/v1/internal/images/upload'

Router.route('/iris/image-upload', {where: 'server'}).post(function () {
  var request = this.request;
  var response = this.response;
  const uploader = new Uploader(URL_UPLOAD);
  const readable = new Readable();
  readable._read = () => {};
  request.on("data", (data) => {
    readable.push(data);
  })
  request.on("end", () => {
    readable.push(null);
    uploader.upload(readable, { type: 'admincentre' })
      .then((res) => res.json())
      .then((res) => {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(res));
      })
      .catch((err) => {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify(err));
      });
  });
});