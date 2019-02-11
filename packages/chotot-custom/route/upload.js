import Request from 'request';
Router.route('/upload-image', {where: 'server'}).post(function () {
  var request = this.request;
  var response = this.response;
  var chototUploadImage = Request.post('https://upload.chotot.vn/api/v1/upload/')
  request.pipe(chototUploadImage);
  chototUploadImage.pipe(response);
})
