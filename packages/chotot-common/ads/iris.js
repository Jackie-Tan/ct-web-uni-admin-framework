// IRIS_ADDR = https://static.chotot.org
// IRIS_SOURCE = ceph://ads/origin
// IRIS_SALT_KEY = 73757368690a
// IRIS_SECRET_KEY = 626164626f79640a
const { URLGenerator } = require('ct-iris-client');

let config = {
  "iris": {
    "addr": "https://static.chotot.org",
    "image_format": "jpg",
    "image": {
      "max_width": 800,
      "max_height": 640,
      "quality": 80,
      "watermark": false
    },
    "thumb": {
      "max_width": 200,
      "max_height": 150,
      "quality": 80,
      "watermark": false
    },
    "salt_key": "73757368690a",
    "secret_key": "626164626f79640a"
  }
}



const generator = new URLGenerator(config.iris.addr, config.iris.salt_key, config.iris.secret_key)

module.exports = function (id, options) {
  let imageOption = config.iris.image;
  if (options){
    imageOption = {...imageOption, ...options}
  }
  imageOptionGenerator = generator.new()
    .setImageOption("fit", imageOption.max_width, imageOption.max_height, imageOption.quality, `${id}`, config.iris.image_format);
  if (imageOption.watermark) {
    imageOptionGenerator.setWatermarkOption("ce")
  }

  return imageOptionGenerator.generate();
}