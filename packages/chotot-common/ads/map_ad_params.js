'use strict'
const MAP_TYPES = {
  "integer": "number",
  "string": "text"
};

function getType(type) {
  if (MAP_TYPES[type])
    return MAP_TYPES[type];
  return type
}

function getOptions(opts, name) {
  let options = [{
    "value": '',
    "display": `vui lòng chọn ${name}`
  }]
   opts.map(function(opt){
    let key = Object.keys(opt)[0]
    options.push({
      value: key,
      display: opt[key]
    })
     return opt;
  })
  return options;
}
function getInput(item, name, parent) {
  if (item.options) {
    return {
      "type": "select",
      "options": getOptions(item.options, name),
      "subtype": getType(item.type),
      "next": getNext(item)
    }
  }
  return {
    "type": getType(item.type),
    "placeHolder": `vui lòng nhập ${name}`
  }

}
function getNext(item) {
  let next = [];
  if (item.toggles && item.toggles.length) {
    for (let key of item.toggles) {
      let input = item[key];
      next.push({
        key: `_params_.${key}`,
        text: input[Object.keys(input)[0]].label,
        input: {
          displayClass: "col-md-12 hidden",
          type: "select",
          options: [],
          subtype: "number"
        }
      })
    }
    return next;
  }
  return null;
}
function getEvents(item) {
  let events = {"change" : {"map": []}};
  if (item.toggles && item.toggles.length) {
    for (let input of item.toggles) {
      events.change.map.push({[input]: item[input]})
    }
    return events;
  }
  return null;
}
module.exports = (item, value) => {
  let key = Object.keys(item)[0];
  item = item[key];
  if (value) {
    item = item[value];
  }
  try {
    return {
      key: `_params_.${key}`,
      text: item.label,
      isOptional: !item.require,
      input: getInput(item, item.label),
      events: getEvents(item)
    } }
  catch (e) {
    console.trace(e);
    return {}
  }
}
