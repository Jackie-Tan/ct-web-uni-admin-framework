const TOGGLE_TO = {
  "carmodel": {
    "key": "carbrand",
    "group_key": "car_brand",
    "end_key": "model",
    "toggle_reference": "name"
  },
  "motorbikemodel": {
    "key": "motorbikebrand",
    "group_key": "motorbike_brand",
    "end_key": "model",
    "toggle_reference": "name"
  },
  "mobile_model": {
    "key": "mobile_brand",
    "group_key": "mobilebrand",
    "end_key": "mobilemodel",
    "extend": {
      'required': {
        'company': true,
        'private': true
      },
      'smart_brand_ids': [1, 2, 3, 21, 4, 22, 5, 6, 7, 8, 19, 23, 9, 24, 10, 11, 25, 13, 14, 12, 15, 20],
      'feature_brand_ids': [17, 16, 18, 20]
    },
    "extend_toggle": {
      'required': {
        'company': true,
        'private': true
      }
    }
  },
  "tablet_model": {
    "key": "tablet_brand",
    "group_key": "tabletbrand",
    "end_key": "tabletmodel",
    "extend": {
      'required': {
        'company': true,
        'private': true
      }
    },
    "extend_toggle": {
      'required': {
        'company': true,
        'private': true
      }
    }
  },
  "pc_model": {
    "key": "pc_brand",
    "group_key": "pcbrand",
    "end_key": "pcmodel",
    "extend": {
      'required': {
        'company': true,
        'private': true
      }
    },
    "extend_toggle": {
      'required': {
        'company': true,
        'private': true
      }
    }
  },
  "accessories_type": {
    "key": ["accessories_class"],
    "group_key": "accessoriesclass",
    "end_key": "accessoriestype"
  },

  "component_type": {
    "key": ["component_class"],
    "group_key": "componentclass",
    "end_key": "componenttype"
  },

  "auvi_brand": {
    "key": ["auvi_type"],
    "group_key": "auvitype",
    "end_key": "auvibrand"
  },
  "swatch_model": {
    "key": ["swatch_brand"],
    "group_key": "swatchbrand",
    "end_key": "swatchmodel"
  }
}
const PARAMS_PRIORITY = {
  "projectid": {
    "bigCate": 1000,
    "pos": 2,
  },
  "size": {
    "bigCate": 1000,
    "pos": 1
  }
}

let getLabel = function (param) {
  return (Bconf.getS(`label_settings.${param}.1.vi.value`) || "").replace("label:", "")
}

const MAP_BY_TYPES = {
  "date": function (value) {
    return parseInt(value) * 1000
  },
  "multiselect": function (value) {
    if (!value)
      return [];
    let param = Bconf.adParams[this._key] || {};
    let delimiter = param.delimiter || ',';
    return value.split(delimiter)
  }
}

let valueParams = function (param) {
  return function (data, cb) {
    let value = data.new_params[param];
    if (MAP_BY_TYPES[this._input.type]) {
      return cb(MAP_BY_TYPES[this._input.type].call(this, value))
    }
    return cb(value)
  }
}
let displayParams = function (param) {
  return function (data, cb) {
    let value = data.new_params[param]
    let textValue = Bconf.getS(`common.${param}.${value}`);
    let last = textValue || value;
    if (last === "")
      this.hide()
    return cb(last)
  }
}
let placeHolder = function (param) {
  return `Vui lòng nhập ${getLabel(param)}`
}
let pongParams = function (param) {
  return function () {
    if (Bconf.getS(`controlpanel.modules.adqueue.editable.param.${param}`) !== "1")
      return this.disable()
    return this.enable()
  }
}
let getOptions = function (options, {param} = {}) {
  let resp = [{value: "", display: placeHolder(param)}]
  for (let key in options) {
    let display = options[key]
    if (typeof display == 'object')
      display = display.name;
    resp.push({value: key, display: display, text: display})
  }
  return resp
}
const MAP_TYPES = {
  "multiple_choice": "multiselect",
  "date": "date",
  "ref": "ref",
  "select": "select",
  "radio": "radio",
  "number": "number",
  "integer": "number",
  "string": "text",
};
var MAP_TYPES_RANK = {};
(function () {
  let count = 0
  for (let key in MAP_TYPES) {
    MAP_TYPES_RANK[key] = count++;
  }
})()


const MAP_SUB_TYPES = {
  "number": "number",
  "integer": "number",
  "string": "text",
  "multiple_choice": "multiple_choice",
  "radio": "number",
}

let getCConfType = function (paramDef = {}) {
  return (paramDef.cp && paramDef.cp.type) || (paramDef.chapy && (paramDef.chapy.newad_type3 || paramDef.chapy.newad_type)) || paramDef.apitype || paramDef.type || 'text'
}
let getSubType = function (paramDef = {}) {
  // let keyboard = paramDef.keyboard;
  // if (keyboard)
  //   return MAP_SUB_TYPES[keyboard] || 'text';
  let type = getCConfType(paramDef)
  if (MAP_SUB_TYPES[type])
    return MAP_SUB_TYPES[type];
  return type
}
let getMaxType = function (typeA, typeB) {
  let rankA = MAP_TYPES_RANK[typeA] || 0;
  let rankB = MAP_TYPES_RANK[typeB] || 0;
  if (rankB < rankA)
    return typeB;
  return typeA
}
let infoType = function (type, param, options) {
  let toggleBy = TOGGLE_TO[param];
  if (toggleBy) {
    return getMaxType(type, 'ref')
  }
  if (options) {
    return getMaxType(type, 'select')
  }
  return type
}
let getType = function (param, paramDef = {}, options) {
  let type = getMaxType(paramDef.keyboard || "string", infoType(getCConfType(paramDef), param, options))
  if (MAP_TYPES[type])
    return MAP_TYPES[type]
  return 'text';
}
let addInputData = function (input, param, options, more) {
  //common
  //ad-hoc
  if (input.type == 'select') {
    input.options = getOptions(options, {param})
    return input;
  }
  if (input.type == 'multiselect') {
    input.ref = function (opt, cb) {
      cb(getOptions(options, {param}).slice(1))
    }
    return input
  }
  let toggleBy = TOGGLE_TO[param];
  if (toggleBy) {
    let {prefix} = more;
    input.ref = function (opt, cb) {
      let parent = toggleBy.key
      let parentValue = this.another(prefix + '.' + parent).get();
      if (!parentValue)
        return cb([{value: "", display: placeHolder(parent)}])
      cb(getOptions(Bconf.getS(`common.${toggleBy.group_key}.${parentValue}.${toggleBy.end_key}`), {param}))
    }
    return input
  }
  return input;
}
let isOptions = function (param) {
  let paramDef = Bconf.adParams[param] || {};
  let keyboard = paramDef.keyboard;
  return !keyboard && Bconf.getS(`common.${param}`)
}
let getInput = function (param, more = {prefix: "", non_editable_conf}) {
  let paramDef = Bconf.adParams[param];
  let options = isOptions(param);
  let {prefix, non_editable_conf} = more;
  let input = {
    "type": getType(param, paramDef, options),
    "subtype": getSubType(paramDef),
    "pong": !non_editable_conf ? pongParams(param) : null,
    "placeHolder": placeHolder(param),
    "value": valueParams(param),
    "display": displayParams(param),
  };
  return addInputData(input, param, options, more)
}


module.exports = function (category, type, {
  prefix = "", non_editable_conf, non_label_no_input, except = function (key) {
    return false
  }
} = {}) {
  let params = Bconf.categoryParams[category][type]
  let bigCate = Math.round(parseInt(category) / 1000) * 1000
  let resp = []
  for (let param of params) {
    let sKey = prefix ? `${prefix}.${param}` : param
    if (except(sKey)) {
      continue
    }
    let label = getLabel(param);
    resp.push({
      "key": sKey,
      "use_view": !!label,
      "same_input": true,
      "isOptional": Bconf.getS(`validator_settings.${param}.1.optional.value`) == "1",
      "text": label,
      "input": non_label_no_input && !label ? {enable: false} : getInput(param, {prefix, non_editable_conf}),
      "order": parseInt(Bconf.insertOrder[param] || "9999"),
      "pos": PARAMS_PRIORITY[param] && (PARAMS_PRIORITY[param].bigCate == bigCate) && PARAMS_PRIORITY[param].pos || 0,
    })
  }
  //SORT
  resp.sort(function (a, b) {
    if (a.pos < b.pos)
      return 1;
    if (a.pos > b.pos)
      return -1;
    return a.order > b.order ? 1 : -1;
  })
  return resp
}
