const { Storage } = require('@google-cloud/storage');
const formidable = require('formidable');
const STATIC_DOMAIN = process.env.NODE_ENV === 'production' ? 'https://static.chotot.com' : 'https://st-test.chotot.org';
const BUCKET_NAME = process.env.BUCKET_NAME || 'static-chotot-cm';
const CREDENTIALS = process.env.GCS_CREDENTIALS_JSON ? JSON.parse(Buffer.from(process.env.GCS_CREDENTIALS_JSON, 'base64').toString('ascii')) : {};

Router.route('/gcs/upload', {where: 'server'}).post(function () {
  const request = this.request;
  const response = this.response;
  const form = new formidable.IncomingForm();
  form.parse(request, function(err, fields, files) {
    if (err) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: err }));
    }
    const fileSize = Number((files.file.size / 1024) / 1024);
    if (fileSize > 3) { // If file size > 3mb
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "File too large" }));
    }
    const storage = new Storage({ credentials: CREDENTIALS });
    const timeStamp = new Date().getTime();
    const fileName = `${timeStamp}_${files.file.name}`
    storage
      .bucket(BUCKET_NAME)
      .upload(files.file.path, {
        destination: `promotion/${fileName}`,
      })
      .then(() => {
        const result = {
          file_url: `${STATIC_DOMAIN}/promotion/${fileName}`,
          status: 200,
        }
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(result));
      })
      .catch((err) => {
        console.log('err', err);
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: err }));
      });
  });
});