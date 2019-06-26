const ACCESS_KEY = process.env.S3_ACCESS_KEY || 'U22CBQGXWFNMHCL14F6Q';
const SECRET_KEY = process.env.S3_SECRET_KEY || '4rZuxyVkCd14siy1zFuWaTBBOIBKEKZktFo9dZ5Q';
const DOMAIN = process.env.S3_DOMAIN || 'http://rgw.chotot.com'
const STATIC_URL = process.env.S3_STATIC_URL || 'https://static.chotot.com.vn/storage'
const PATH = '/' + (process.env.S3_BUCKET || 'admin-centre');
const encrypt = require('./lib/encrypt')
import Request from 'request';
const FWRequrest = function (length = 2) {
  var request = this.request;
  //TODO refactor headers
  var FOLDER = '/' + request.originalUrl.split('/').slice(-length).join('_');
  let file_name = `${FOLDER}_${new Date().getTime()}.jpg`
  UploadS3.call(this, FOLDER, file_name)
}

const UploadS3 = function (FOLDER, fileName) {
  var request = this.request;
  var response = this.response;
  //TODO refactor headers
  let time = (new Date()).toUTCString()
  let s = `PUT\n\nimage/jpeg\n\nx-amz-acl:public-read\nx-amz-date:${time}\n${PATH + FOLDER + fileName}`;
  let headers = {};
  headers['content-type'] = 'image/jpeg'
  headers['x-amz-date'] = time;
  headers['x-amz-acl'] = 'public-read'
  headers['Authorization'] = "AWS " + ACCESS_KEY + ":" + encrypt.b64_hmac_sha1(SECRET_KEY, s);
  var url = DOMAIN + PATH + FOLDER + fileName
  var chototUploadImage = request.pipe(Request.put({ method: 'PUT', uri: url, headers: headers }))
  chototUploadImage.on('response', function (resp) {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ url: STATIC_URL + PATH + FOLDER + fileName }))
  }).on('error', function (err) {
    console.error(err)
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: err.message }))
  });
}

Router.route('/s3-upload/:folder', { where: 'server' }).put(function () {
  FWRequrest.call(this, 1);
})

Router.route('/s3-upload/:prefix/:folder', { where: 'server' }).put(function () {
  FWRequrest.call(this, 2);
})

Router.route('/s3-upload-keep-file-name/:folder/:file_name', { where: 'server' }).put(function () {
  let folder = this.params.folder
  let fileName = this.params.file_name
  if (folder && fileName) {
    UploadS3.call(this, `/${folder}`, `/${fileName}`);
  }
})