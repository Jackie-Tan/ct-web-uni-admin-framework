
FormatType = {
  "number": wrapCb(toNumber),
  "radio": wrapCb(valOrCheck),
  "checkbox": wrapCb(valOrCheck),
  "files": uploadFiles,
  "default": wrapCb(defaultFunc)
}
function wrapCb(func) {
  return function (el, cb) {
    return cb(func(el))
  }
}
function toNumber(el) {
  if (!el.attr('step'))
    return parseInt(el.val()) || null;
  return parseFloat(el.val()) || null;
}
function valOrCheck(el) {
  let val = el.val();
  if (['__break__', '__join__'].indexOf(val) != -1)
    return val;
  if (el.prop('checked')) {
    if (val == 'on')
      return true;
    return val;
  }
  return false;
}

function uploadFiles(el, cb) {
  var files = el.prop("files");
  if (el.data('kind') === 'csv')
    return GetData.parseCSV(el, cb);
  if (el.data('kind') === "attachment")
    return Images.sendFile().then(cb).catch((error) => {
      dsLog.error("upload error!")
      cb()
    })
  return Images.sendFile().then(cb).catch((error) => {
    dsLog.error("upload error!")
    cb()
  })
}
function defaultFunc(el) {
  var value = el.val();
  if (el.data('type') == 'date') {
    if (el.data('subtype') == 'text')
      return value
    const date = new Date(value);
    if (!date.getTime())
      return null;
    if (el.data('subtype') == 'number')
      return Math.round(date /1000);
    return date;
  }
  return (typeof value == "string" && value.trim()) || value || null;
}

FormatTypeWithoutEl = {
  "number": wrapCb(toNumber),
  "radio": wrapCb(valOrCheck),
  "checkbox": wrapCb(valOrCheck),
  "files": uploadFiles,
  "default": wrapCb(defaultFunc)
}
