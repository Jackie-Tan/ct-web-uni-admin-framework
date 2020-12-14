const { Uploader } = require('ct-iris-client');
const Request = require('request');

const URL_UPLOAD = process.env.IRIS_URL || 'https://gateway.chotot.org/v1/internal/images/upload'

Router.route('/iris/image-upload', {where: 'server'}).post(function () {
  var request = this.request;
  var response = this.response;
  const uploader = new Uploader(URL_UPLOAD);
  var chototUploadImage = Request.post(URL_UPLOAD)
  request.pipe(chototUploadImage);
  chototUploadImage.pipe(response);
});