const { Storage } = require('@google-cloud/storage');
const formidable = require('formidable');
const STATIC_DOMAIN = process.env.NODE_ENV === 'production' ? 'https://static.chotot.com' : 'https://st-test.chotot.org';
const BUCKET_NAME = 'static-chotot-cm';
const CREDENTIALS = {
  "type": "service_account",
  "project_id": "cicd-222403",
  "private_key_id": process.env.GCS_PRIVATE_KEY_ID || "8e143cb67760b48bb75b82c4e9b89a701cccc2da",
  "private_key": process.env.GCS_PRIVATE_KEY,
  "client_email": "static-promotion-sa@cicd-222403.iam.gserviceaccount.com",
  "client_id": "115546616626907412303",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/static-promotion-sa%40cicd-222403.iam.gserviceaccount.com"
};

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