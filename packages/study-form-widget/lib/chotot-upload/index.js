var imagesTypes = ["image/png", "image/jpeg", "image/gif"];
var Images = {
  validateImgBase64: (src) => {
    //console.log('src',src);
    if (!/^data:image\/png;base64,/i.test(src) && !/^data:image\/jpeg;base64,/i.test(src)) {
      throw new Meteor.Error("500", "ImageNotDecode");
    }
    return true;
  },
  sendS3: function (file, opt) {
    return new Promise((resolve, reject) => {
      var req = new XMLHttpRequest();
      req.open("PUT", opt.url, true);
      //Add all the headers
      req.onreadystatechange = function () {
        if (req.readyState == 4) {
          if (req.response) {
            return resolve(JSON.parse(req.response));
          }
          return resolve("");
        }
      };
      req.send(file);
      return req;
    });
  },
  sendFile: function (form_data, opt) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: opt.url || "/upload-image",
        cache: false,
        contentType: false,
        processData: false,
        async: false,
        data: form_data,
        type: "post",
        success: function (data) {
          resolve(data);
        },
        error: function (error) {
          console.error(error);
          reject("");
        },
      });
    });
  },
  storeImage: function (file, opt) {
    var form_data = new FormData();
    if (data instanceof FormData) {
      form_data = data;
    } else {
      form_data.append("file", data);
      form_data.append("has_thumbs", 1);
      form_data.append("width", 250);
    }

    return Images.sendFile(form_data, opt);
  },
  storeFile: function (file, opt) {
    var form_data = new FormData();
    form_data.append("file", file);
    return Images.sendFile(form_data, opt);
  },
  store: (files, type) => {
    var f,
      ref,
      tmp,
      indexOf =
        [].indexOf ||
        function (item) {
          for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && this[i] === item) return i;
          }
          return -1;
        };
    var i = 0;
    while ((f = files[i])) {
      if (((ref = f.type), indexOf.call(imagesTypes, ref) < 0)) {
        alert("not support the file type: " + ref);
      } else {
        if (type == "image") return Images.storeImage(f, {});
        return Images.storeFile(f, {});
      }
      i++;
    }
    return tmp;
  },
  dataURItoBlob: (dataURI) => {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(",")[0].indexOf("base64") >= 0) byteString = atob(dataURI.split(",")[1]);
    else byteString = unescape(dataURI.split(",")[1]);

    // separate out the mime component
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
  },
  getImgFromBase64: (dataURL, fileName) => {
    var blob = Images.dataURItoBlob(dataURL);
    var file = Images.blobToFile(blob, fileName);
    return Images.storeImage(file);
  },
  blobToFile: (theBlob, fileName) => {
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
  },
};

module.exports = Images;
