const crypto = require('crypto')
const ACCESS_KEY = process.env.S3_ACCESS_KEY || 'U22CBQGXWFNMHCL14F6Q';
const SECRET_KEY = process.env.S3_SECRET_KEY || '4rZuxyVkCd14siy1zFuWaTBBOIBKEKZktFo9dZ5Q';
const DOMAIN = process.env.S3_DOMAIN || 'http://rgw.chotot.com'
const STATIC_URL = process.env.S3_STATIC_URL || 'https://static.chotot.com.vn/storage'
const PATH = '/' + (process.env.S3_BUCKET || 'admin-centre');
const encrypt = require('./lib/encrypt')
import Request from 'request';
Router.route('/s3-upload/:folder', {where: 'server'}).put(function () {
  var request = this.request;
  var response = this.response;
  //TODO refactor headers
  let headers = {};
  var FOLDER = '/'+request.originalUrl.split('/')[2];
  let time =(new Date()).toUTCString()
  let file_name = `${FOLDER}_${new Date().getTime()}.jpg`
  let s = `PUT\n\nimage/jpeg\n\nx-amz-acl:public-read\nx-amz-date:${time}\n${PATH+FOLDER+file_name}`;
  headers['content-type'] = 'image/jpeg'
  headers['x-amz-date'] = time;
  headers['x-amz-acl'] = 'public-read'
  headers['Authorization'] = "AWS " + ACCESS_KEY + ":" + encrypt.b64_hmac_sha1(SECRET_KEY,s);
  var url = DOMAIN+PATH+FOLDER+file_name
  var chototUploadImage = request.pipe(Request.put({method:'PUT', uri: url, headers: headers}))
  // console.log(process.env.IMAGINARY_UPLOAD+'/'+image_id);
  chototUploadImage.on('response', function (resp) {
      response.writeHead(200, {"Content-Type": "application/json"});
      response.end(JSON.stringify({url: STATIC_URL + PATH + FOLDER + file_name}))
  }).on('error', function(err) {
    console.error(err)
    response.writeHead(400, {"Content-Type": "application/json"});
    response.end(JSON.stringify({error: err.message}))
  });
})

