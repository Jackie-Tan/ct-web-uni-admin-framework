Bconf = {
  baseGet: function(bKey, data) {
    let keys = (""+bKey).split('.');
    if (!keys.length)
      return null
    let ptr = data
    for (let key of keys) {
      if (!ptr || !ptr[key])
        return null;
      ptr = ptr[key]
    }
    return ptr
  },
  get : function(bKey){
    return Bconf.baseGet(bKey, Bconf.data)
  },
  getS : function(bKey){
    return Bconf.baseGet(bKey, Bconf.dataS)
  },
  data: null,
  dataS: null,
  adParams: {},
  categoryParams: {},
  insertOrder: {},
  categories: [],
  types: [],

}
var regex = new RegExp("([\*][\.])","g");

function GetPtr(start, k, opts = {}) {
  const {upsert} = opts;
  let ptr = start;
  k = k.replace(regex, "");
  let keys = k.split('.')
  if (!keys.length)
    return {ptr: {}, endKey: ''};
  let endKey = keys.pop();
  for (let key of keys) {
    if (!ptr[key]) {
      if (!upsert) {
        return {ptr: {}, endKey: ''};
      }
      ptr[key] = {};
    }
    ptr = ptr[key];
  }
  return {ptr, endKey};
}
function BconfInit(data, bconf) {
  for (let k in data) {
    let value = data[k];
    if (value === "") {
      let {ptr, endKey} = GetPtr(bconf, k);
      delete ptr[endKey];
      continue;
    }
    let {ptr, endKey} = GetPtr(bconf, k, {upsert: true});
    ptr[endKey] = value;
  }
}

function runBconf(cmd, key, address, cb) {
  HTTP.call('GET', `http://${address}/${cmd}`,{}, function (err, res) {
    if (err) {
      cb(err);
      return logger.error(`can't not get bcconf ${key} ${address}/${cmd}`, err)
    }
    let data = res && res.data;
    let tmpBconf = {};
    if (data) {
      BconfInit(data, tmpBconf);
      Bconf[key] = tmpBconf;
      cb && cb()
    }
  })

}

var cachingStatic = [
  function() {
    let adParams = Bconf.getS('common.ad_params');
    if (adParams) {
      for (let index in adParams) {
        Bconf.adParams[adParams[index].name] = adParams[index];
      }
    }
    let insertOrder = Bconf.getS('insert_param_order');
    if (insertOrder) {
      for (let index in insertOrder) {
        Bconf.insertOrder[insertOrder[index]] = index
      }
    }
    let categoryParams = Bconf.getS('category_settings.params.1');
    if (categoryParams) {
      for (let cate in categoryParams) {
        if (cate == "keys") continue
        if (!Bconf.categoryParams[cate]) {
          Bconf.categoryParams[cate] = {}
        }
        for (let type in categoryParams[cate]) {
          Bconf.categoryParams[cate][type] =categoryParams[cate][type].value.split(',');
        }
      }
    }
    let categories = []
    let listCate = Bconf.getS(`cat_order`);
    for (let order in listCate) {
      let category = listCate[order]
      let bigCate = Math.round(parseInt(category)/1000)*1000
      if (bigCate == category) {
        categories.push({"value": category, "display": `--${Bconf.getS(`cat.${category}.name.vi`)}--`, "is_disable": true, "css":"background-color:#dcdcc3;font-weight:bold;"});
        continue
      }
      categories.push({"value": category, "display": Bconf.getS(`cat.${category}.name.vi`)});
    }

    categories.sort((a, b) => parseInt(a.value) - parseInt(b.value))
    categories.unshift({"value": "", "display": "chọn danh mục"})

    Bconf.categories = categories;
    let regions = [];
    let areas = {}
    let listRegion = Bconf.getS(`common.region_order`);
    for (let order in listRegion) {
      let region = listRegion[order]
      regions.push({"value": region, "display": `${Bconf.getS(`common.region.${region}.name.vi`)}`})
      areas[region] = [{"value": "", "display": "vui lòng chọn quận/huyên"}];
      let listArea = Bconf.getS(`common.region.${region}.municipality`)
      for (let area in listArea) {
        areas[region].push({"value": area, "display": `${listArea[area].name.vi}`})
      }
    }
    Bconf.regions = regions;
    Bconf.areas = areas;
    let regions_v2 = [{"value": "", "display": "vui lòng chọn tỉnh/thành phố"}];
    let areas_v2 = {};
    let wards = {}
    let listRegionV2 = Bconf.getS(`common.1.region_v2_order`);
    for (let order in listRegionV2) {
      let region = listRegionV2[order];
      regions_v2.push({"value": region, "display": `${Bconf.getS(`common.1.region_v2.${region}.name.vi`)}`})
      areas_v2[region] = [{"value": "", "display": "vui lòng chọn quận/huyên"}];
      let listArea = Bconf.getS(`common.1.region_v2.${region}.municipality`)
      for (let area in listArea) {
        areas_v2[region].push({"value": area, "display": `${listArea[area].name.vi}`})
        wards[area] = [{"value": "", "display": "vui lòng chọn phường/xã"}];
        let listWard = Bconf.getS(`common.1.area_v2.${area}.ward`);
        for (let ward in listWard) {
          wards[area].push({"value": ward, "display": `${listWard[ward].name.vi}`})
        }
      }
    }
    Bconf.regions_v2 = regions_v2;
    Bconf.areas_v2 = areas_v2;
    Bconf.wards = wards;

    let roles = [];
    let modules = Bconf.getS(`controlpanel.modules`);
    for (let mKey in modules) {
      let subRoles = [];
      let mValue = modules[mKey];
      if (!mValue.name)
        continue;
      (function(){
        if (!mValue.subprivs)
          return;
        mValue.subprivs = mValue.subprivs || {};
        for (let smKey in mValue.subprivs) {
          let smValue = mValue.subprivs[smKey];
          let smMenu = mValue.menu && mValue.menu[smKey] || {};
          subRoles.push({parent: mKey, module: smKey, order: parseInt(smMenu.order) || 0, type: smValue.type, text: smValue.name})
        }
        subRoles.sort((a,b) =>{
          if (a.order == b.order) {
            if (a.text >= b.text)
              return 1;
            return -1;
          }
          return a.order - b.order;
        });
      })()
      roles.push({module: mKey, order: parseInt(mValue.order) || 0, type: 'checkbox', text: mValue.name, roles: subRoles});
    }
    let adminRoles = Bconf.getS(`controlpanel.admin_privs`);
    for (let mKey in adminRoles) {
      let mValue = adminRoles[mKey];
      roles.push({module: mKey, order: 0, type: 'checkbox', text: mValue, roles: []});
    }
    roles.sort((a,b) =>{
      return a.text.toLowerCase() > b.text.toLowerCase()?1:-1;
    });
    Bconf.roles = roles;
    let types = [];
    let rawTypes = Bconf.getS('lang_settings.code_message.1.type');
    for (let type in rawTypes) {
      types.push({value: type, display: (function(){
        try {
          return rawTypes[type].vi.value.replace("value:","");
        } catch(e) {
          console.warn('type config error at', type);
        }
        return '';
      })()});
    }
    Bconf.types = types;
  }
]

module.exports = {
  Bconf,
  runBconf,
  confOpts: {
    'bconf': {
      cmd: 'conf',
      key: 'data',
      address: `${process.env.CP_HOST}:${process.env.CP_PORT}/v1`,
    },
    'bconfS': {
      cmd: 'unify-all',
      key: 'dataS',
      address: `${process.env.GATEWAY_URL}/v1/internal/chapy-pro`,
      addons: cachingStatic,
    }
  },
};