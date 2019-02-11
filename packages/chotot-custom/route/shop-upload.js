const URL_UPLOAD_AVATAR = process.env.GATEWAY_URL + (process.env.SHOP_IMAGE_UPLOAD_AVATAR || '/v1/internal/shops/accounts/{accountId}/temp/avatar')
const URL_UPLOAD_COVER = process.env.GATEWAY_URL + (process.env.SHOP_IMAGE_UPLOAD_COVER || '/v1/internal/shops/accounts/{accountId}/temp/cover')
import Request from 'request';
Router.route('/onbehalf/shop/cover', {where: 'server'}).post(function () {
  var request = this.request;
  var response = this.response;
  let {accountId} = this.request.query
  console.log(URL_UPLOAD_COVER.replace("{accountId}", accountId))
  var chototUploadImage = Request.post(URL_UPLOAD_COVER.replace("{accountId}", accountId))
  request.pipe(chototUploadImage);
  chototUploadImage.pipe(response);
})
Router.route('/onbehalf/shop/avatar', {where: 'server'}).post(function () {
  var request = this.request;
  var response = this.response;
  let {accountId} = this.request.query
  console.log(URL_UPLOAD_AVATAR.replace("{accountId}", accountId))
  var chototUploadImage = Request.post(URL_UPLOAD_AVATAR.replace("{accountId}", accountId))
  request.pipe(chototUploadImage);
  chototUploadImage.pipe(response);
})
//
