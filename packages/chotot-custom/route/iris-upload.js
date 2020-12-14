const { Uploader } = require('ct-iris-client');
const Request = require('request');
const { Readable } = "stream";

const URL_UPLOAD = process.env.IRIS_URL || 'https://gateway.chotot.org/v1/internal/images/upload'

Router.route('/iris/image-upload', {where: 'server'}).post(function () {
  var request = this.request;
  var response = this.response;
  const uploader = new Uploader(URL_UPLOAD);
  const { image } = this.request.query;
  console.log('this.request.query', this.request.query);
  const readable = new Readable();
  // var chototUploadImage = Request.post(URL_UPLOAD)
  request.pipe(uploader.upload(image, { type: 'admincentre' }));
  uploader.pipe(response);
  // request.on("data", (data) => {
  //   readable.push(data);
  // })
  // request.on("end", () => {
  //   readable.push(null);
  //   fetch(`${process.env.GATEWAY_URL}/v1/internal/images/upload`, {
  //     body: readable,
  //     headers: {
  //       "content-type": request.headers["content-type"],
  //       "content-length": request.headers["content-length"],
  //     },
  //     method: "POST",
  //   })
  //     .then((res) => res.json())
  //     .then((res) => {
  //       response.writeHead(200, { "Content-Type": "application/json" });
  //       response.end(JSON.stringify({ url: res.image_url }));
  //     })
  //     .catch((err) => {
  //       response.writeHead(400, { "Content-Type": "application/json" });
  //       response.end(JSON.stringify({ error: err.message }));
  //     });
  // });
});