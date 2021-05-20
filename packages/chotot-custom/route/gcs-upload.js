const { Storage } = require('@google-cloud/storage');
const formidable = require('formidable');
const STATIC_DOMAIN = 'https://st-test.chotot.org';
const BUCKET_NAME = 'static-chotot-cm';
const CREDENTIALS = {
  "type": "service_account",
  "project_id": "cicd-222403",
  "private_key_id": "8e143cb67760b48bb75b82c4e9b89a701cccc2da",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCSO4Z2Be8ZY1mi\nBPgxu+C/S4CNziVJJT7+3onbo6IQyqxmYGQCOYQ75Kf0AZXduNwlEMioLHxmeHjK\nQkhfjBe9nvI0UcuiTE529bjvZlpgmbQihXlEjj2xlXQu9EgTvddyuqxROExKV4iH\nxf0+UHGuHjDOc3nwGf5sWoouC2rf1sCnoVejGNKa0NvdiBf4GYgtlfh/zopKxIvH\nfJb9HGlmVKn3LH3+j/pJSJFzZ5A9AixeCO/X7OVtm002mOpq6DXZwT5DcbqXNZVn\noRAeo0KMmXk1ifUFJoj04KqFI4Qs8SNUnZ4DEj6xtfISLdzF/woJa9DWAn+11x7u\n7enfcu6jAgMBAAECggEALxLcaRfl7U1PKFnjL9dkNRBwFLYcyJwl2FP5GuxlGnSz\n5Mz4xMKRL9qeumzcOqDstT3e6kxPy4jSkYGe3KszZUZKf88o91kLFT5qxx4yz9AK\n7eX7sLb9YzJSUV8v6LL/LR6spAS0gmYFPHfe2vV4cu2jFoKT6Vfk0CqhOstQHzf8\n8Dnj5JYm0BoshZCebo74aF6o2wwiHZdRJ7iRiqilKDiwW/bCX/6YXt15U9o1iKg6\nSjgTHyS+2Su+PknsyaCIIbgZR6qVHeYGu4mHGt1HFP7wj43IMMOpfMe6gH7tQQpD\n+zlPfudQEcJ4gpAGrbL3BuijdI9AKgyP4BbaN3xqKQKBgQDH1VDYkSI76c1DX5Gd\nY57OVrei5X0tN99m1oHPe08h/r2l58iAl1Cgf3B/tq0U4AH+aPikja7PFAWNybiL\nnfBmGzHbdTfHYna0XOqVSkz1WAJRhUX7qXZuiV+d3Y/oLwx6Jcm12KFhXYa8uveg\n2PsdP9OlpKAg+oZA6g+iYUuczwKBgQC7VXQJYnybyOtFTTR5QVRVQMCv714/lA+R\nwBGvmXY0Wu+BU/kRvlxiTR27DprkK4HcXCc/kMT5Q8Wvk804pLCiRgzhVYbiiiVe\n9DZhiVqV75TqYSH9FsQiU4L/6SVVr3AVzesvIy/TCbiUNQwD9xdbAYnF2xyvdVoj\njbMKZE/N7QKBgC51zP8c9y2g1SVV4eAK2lA03ysTWgAaXmllc/bOP36y4FrjQb2L\n8KXwGzLGQQV6c1w4AZ8Yhc0FZakqfiqPxOWoavYQEbDclqamd6/P/4aHOLrFVpkF\nNFDMxZtJePzNe4QmpvgNbq/Zc8sLWSlfaTrKrSV02fnw5SfQg2QIZPEHAoGBAICP\ntIJ8RGflCxEUWt6cJvQa7CHRdCzNv6GW3oxUFPr5LUTkDBpRObV8ltq4uzO7Z/OC\niqzk/UjTaeeE12H4JAA5cr1xpI/znpH7pxZo3PHo6Zmv71NxPEkSZuSZbDXRoGpW\nVwCSdU+vbCzJ+uT9vdmGxLY0GQuQzbt4k1aeYOZBAoGAQKhF6PpqKcZ8CMRz39VT\naTNH0BWlCkiR+4BdsfReJZvvld6799yidC26osBG9IURnNDSK8/ca0+FEhji30Do\nrlT8RI7tW2Pc8FAvrWyhzuvEEu5QU2ZthBnYGNBLuXdBGV0i90YusH6iNuvvj7N3\nW9Z99vzvecOuS3N+ILN33sQ=\n-----END PRIVATE KEY-----\n",
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