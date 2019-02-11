module.exports = {
  "json": function (value) {
    return JSON.parse(value)
  },
  "default": function (value) {
    return value;
  }
}
