const crypto = require('crypto')
const NAMESPACE = process.env.CEPH_PI_NAMESPACE || 'property_project';
const CEPHKEY = process.env.CEPH_PI_KEY || 'imaginarychototvn';
import Request from 'request';
Router.route('/project-image-upload/:image_id', {where: 'server'}).post(function () {
  var request = this.request;
  var response = this.response;
  var image_id = request.originalUrl.split('/')[2];
  var chototUploadImage = Request.post(process.env.IMAGINARY_UPLOAD+'/'+image_id)
  // console.log(process.env.IMAGINARY_UPLOAD+'/'+image_id);
  request.pipe(chototUploadImage);
  chototUploadImage.on('response', function(res) {
    let url_ext =`/${NAMESPACE}/${image_id}`.replace(/\s/g,"")
    let shaText = crypto.createHmac('sha1', CEPHKEY).update(url_ext).digest('hex');
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({url: process.env.IMAGINARY_URL + "/" + shaText + url_ext}))
  }).on('error', function(err) {
    console.error(err)
    response.writeHead(400, {"Content-Type": "application/json"});
    response.end(JSON.stringify({error: err.message}))
  });
})
