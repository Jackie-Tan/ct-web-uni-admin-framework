const URL_UPLOAD = process.env.SSA_IMAGE_UPLOAD || 'https://gateway.chotot.org/v1/internal/ssa/creatives'
import Request from 'request';
Router.route('/ssa/image-upload', {where: 'server'}).post(function () {
  var request = this.request;
  var response = this.response;
  let {width, height} = this.request.query
  var chototUploadImage = Request.post(URL_UPLOAD+`?width=${width}&height=${height}`)
  request.pipe(chototUploadImage);
  chototUploadImage.pipe(response);
})
//
