var AD_WORD_MARKS = {};
var WORD_MARKS = {}
var CLEAN_UP_CHARS_REG = null
var SPLIT_WORDS = null
var STRIP_ENDING_REG = null
var COLOR_WRAP_SPAN = null
if (typeof window != 'undefined') {
  // ONLY FOR CLIENT SIDE
  CLEAN_UP_CHARS_REG = new RegExp('[^\\d\\w]', 'g')
  SPLIT_WORDS = new RegExp('([^ \\n\\r]+ *)|([\\n\\r]+)')
  try {
    STRIP_ENDING_REG = new RegExp('^(.+?)( *)$', 's');
  } catch (e) {
    //for old web browser
    STRIP_ENDING_REG = new RegExp('^(.+?)( *)$', 'm');
  }
  COLOR_WRAP_SPAN = new RegExp('<span_([^<>]*)\>', 'ig')
}
const LIMIT_QUEUE = 5;
const SHOP_CATE = {
  "1000": "Nhà",
  "5000": "Điện tử",
  "2000": "Xe cộ",

};
const mappingPtyCharacteristics = {
  '1': { name: 'land_feature', value: '1' },
  '2': { name: 'property_road_condition', value: '1' },
  '3': {  name: 'property_back_condition', value: '1' },
};
let func = {
  shop_map_cate(cate) {
    return SHOP_CATE[cate];
  },
  shop_init_data(data, opt = {}) {
    let { IsProduction } = opt;
    let shop_url = data.shop_url = data.shop['urls'][0] && data.shop['urls'][0]['url'];
    var getShopBase = function (type) {
      let url = Bconf.getS(`common.shop.${type}`);
      if (!IsProduction && url) {
        return url.replace(".com", ".org");
      }
      return url
    }
    data.shop_category = data.shop.shopsCategoriesRelationships[0].categoryId

    if (data['shop_category'] == 1000) {
      shop_base_pty_url = getShopBase('shop_base_pty_url');
      data.shop_full_url = shop_base_pty_url + '/chuyen-trang/' + shop_url;
    } else if (data['shop_category'] == 5000) {
      shop_base_elt_url = getShopBase('shop_base_elt_url');
      data.shop_full_url = shop_base_elt_url + '/cua-hang-dien-tu/' + shop_url;
    } else {
      shop_base_url = getShopBase('shop_base_url');
      data.shop_full_url = shop_base_url + '/cua-hang/' + shop_url;
    }
    return data;
  },
  getPage(context) {
    let total = context.total || 0;
    let limit = context.limit || LIMIT_QUEUE
    return Math.ceil(total / limit);
  },
  ad_shop_info(data) {
    let p = data.new_actions_params;
    if (!data.ad.shop_alias || (p.payment_status && ['free', 'paid'].indexOf(p.payment_status) != -1)) {
      return 'Ad to Listing'
    }
    return 'Ad to Shop'
  },
  "getQuery": function (data, cb) {
    let query = Router.current().params.query || {}
    return cb(query[this._oConfig.key])
  },
  getCConfParams(category, type) {
    try {
      console.log(Bconf.categoryParams[category]);
      return Bconf.categoryParams[category][type];
    } catch (e) {
      console.warn('missing config for ', category, type);
      return [];
    }
  },
  historyLink: function (text, ad_id, schema) {
    return `<a href="javascript:void(0)" onclick="window.open('/history_ad?ad_id=${ad_id}&schema=${schema}', 'Ad history', 'width=600, height=500, scrollbars=yes, resizable=yes')">${text}</a>`
  },
  hefWithParams: function (params) {
    let queries = []
    for (let key in params) {
      queries.push(`${key}=${params[key]}`)
    }
    return queries.join('&')
  },
  routeByQuery: function (params) {
    let path = Router.current().originalUrl.split("?")[0];
    return `${path}?${func.hefWithParams(params)}`
  },
  searchHef: function (params) {
    params.offset = params.offset || 0;
    params.limit = params.limit || 20;
    return `/search_for_ad?${func.hefWithParams(params)}`
  },
  searchLink: function (value, params) {
    return `<a target="_blank" href="${func.searchHef(params)}">${value}</a>`
  },
  phoneUIDLink: function (text, uid) {
    return `<a href="javascript:void(0)" onclick="window.open('/phone_uid?uid=${uid}', 'Phone BY UID', 'width=600, height=500, scrollbars=yes, resizable=yes')">${text}</a>`
  },
  uidPhoneLink: function (text, uid) {
    return `<a href="javascript:void(0)" onclick="window.open('/uid_phone?uid=${uid}', 'UID BY Phone', 'width=600, height=500, scrollbars=yes, resizable=yes')">${text}</a>`
  },
  sortDup: function (dups = []) {
    return dups.sort(function (a, b) {
      let rankA = a.rank || { percent: 0 };
      let rankB = b.rank || { percent: 0 };
      return rankA.percent <= rankB.percent ? 1 : -1;
    })
  },
  getImageById: function (key, { IsProduction } = {}) {
    return "/" + ("000000000000" + key).slice(-14);
  },
  initImage: function (data) {
    if (['accepted', 'refused'].indexOf(data.actions.state) != -1) {
      return data.new_images = data.images
    }
    return data.new_images = (data.ad_image_changes || data.images)
  },
  initComapnyLogo: function (data) {
    return data.company_logo = data.company_logo && data.company_logo.name ? [data.company_logo] : [];
  },
  formatVietnamZone: function (timestamp) {
    return timestamp.replace("Z", "+07:00");
  },
  find_text: function (n, m) {
    var l = []
      , o = 0;
    while (m.indexOf(n, o) != -1) {
      l.push(m.indexOf(n, o));
      o = m.indexOf(n, o) + 1
    }
    return l
  },
  text_diff: function (t1, t2) {
    // Shortcut
    if (t1 == t2)
      return (t1);
    t1 = "" + t1;
    t2 = "" + t2;
    let result = [];
    let a1 = [];
    let a2 = [];
    let all1 = [];
    let all2 = [];

    // Split both texts
    all1 = t1.split(SPLIT_WORDS).filter((item) => { return item });
    all2 = t2.split(SPLIT_WORDS).filter((item) => { return item });
    // Clean up insignificant chars.
    for (let o of all1) {
      a1.push(o.replace(CLEAN_UP_CHARS_REG, ""));
    }
    for (let o of all2) {
      a2.push(o.replace(CLEAN_UP_CHARS_REG, ""));
    }
    let i1 = 0;
    let i2 = 0;
    let a1length = a1.length;
    let a2length = a2.length;
    // Traverse the words
    while (i1 < a1length) {
      let o1 = a1[i1]; // Get the original word
      if ((o1 == "" && i2 >= a2length) ||
        (i2 < a2length && o1 == a2[i2])) {
        // Keep identical words
        result.push((i2 >= a2length || all1[i1].length > all2[i2].length) ? all1[i1] : all2[i2])
        i1++;
        i2++;
      } else {
        // Words differ
        // Find position for the next "sync"
        let { n1, n2 } = func.text_diff_find_sync(a1, i1, a2, i2, 1);
        // Skipped text is a diff
        if (n1 != i1) {
          let tmp = [];
          while (i1 != n1) {
            tmp.push(all1[i1])
            i1++;
          }
          let text = tmp.join("");
          // strip ending white-space
          text = text.replace(STRIP_ENDING_REG, "<span class='TextDiffOld'>$1</span>$2");
          result.push(text)
        }
        if (n2 != i2) {
          let tmp = [];
          while (i2 != n2 && i2 < a2length) {
            tmp.push(all2[i2]);
            i2++;
          }
          let text = tmp.join("")
          // strip ending white-space
          text = text.replace(STRIP_ENDING_REG, "<span class='TextDiffNew'>$1</span>$2");
          result.push(text)
        }
      }
    }
    // Leftowers in the new text
    if (i2 < a2length) {
      result.push("<span class='TextDiffNew'>");
      while (i2 < a2length) {
        result.push(all2[i2]);
        i2++;
      }
      result.push("</span>");
    }
    // merge and return
    return result.join("");
  },
  text_diff_find_sync: function (a1, i1, a2, i2, minimum_words) {
    let a1length = a1.length;
    let a2length = a2.length;
    let min_array = a1length;
    if (min_array > a2length) {
      min_array = a2length;
    }

    for (let o = 0; o < a1length - i1; o++) {
      for (let i = o; i < min_array; i++) {
        let c = 0;
        while (i1 + c + i < min_array &&
          i2 + c + i < min_array &&
          a1[i1 + c + i] == a2[i2 + o + c]) {
          c++;
          if (c == minimum_words) {
            return ({ n1: i1 + i, n2: i2 + o });
          }
        }
        c = 0;
        while (i1 + c + i < min_array &&
          i2 + c + i < min_array &&
          a1[i1 + c + o] == a2[i2 + i + c]) {
          c++;
          if (c == minimum_words) {
            return ({ n1: i1 + o, n2: i2 + i });
          }
        }
      }
    }
    return { n1: a1length, n2: a2length };
  },
  get_new_category: function (category) {
    return [category]
  },
  get_word_marks: function (category, type) {
    if (WORD_MARKS[category] && WORD_MARKS[category][type])
      return WORD_MARKS[category][type]
    let res = [];
    let category_array = [];
    let arr = Bconf.get('controlpanel.modules.adqueue.highlight.text');
    let type_short = Bconf.getS(`common.type.${type}.short_name`);
    if (!arr)
      return res;
    /* Check for old category */
    if (category < 1000)
      category_array = func.get_new_category(category);
    else
      category_array.push(category);
    for (let category_value of category_array) {
      for (let w_index in arr) {
        let word = arr[w_index]
        if (word['categories'] && word['categories'] != '*') {
          let cats = word['categories'].split(',')
          if (cats.indexOf(category_value) == -1)
            continue;
        }
        if (word['types'] && word['types'] != '*') {
          let types = word['types'].split(',');
          if (types.indexOf(type_short) == -1)
            continue;
        }
        res.push(word);
      }
    }
    return res;
  },
  text_clean: function (text) {
    if (!text)
      return '';
    return text.replace(/\</g, '&lt;');
  },
  apply_word_marks: function (text, key, options) {
    if (!text)
      return '';
    if (AD_WORD_MARKS[options.ad_id] && AD_WORD_MARKS[options.ad_id][key])
      return AD_WORD_MARKS[options.ad_id][key];
    let word_marks = func.get_word_marks(options.category, options.type)
    for (let mark of word_marks) {
      if (mark['where'] && mark['where'] != '*') {
        let where = mark['where'].split(',');
        if (where.indexOf(key) == -1)
          continue;
      }
      let color = null;
      if (mark['color'])
        color = Bconf.getS(`controlpanel.modules.adqueue.highlight.color.${mark['color']}`);

      let regex = mark['regex'];
      if (mark['word_boundary'] !== "0" && mark['word_boundary'])
        regex = `([[:<:]]${regex}[[:>:]])`;
      /* Only match outside of tags */
      regex = `(>)|(${regex})`;
      try {
        var regexObj = new RegExp(regex, 'ig');
      } catch (e) {
        continue;
      }
      let before = 0;
      text = text.replace(regexObj, (match, p1, p2, p3) => {
        let pos = p3;
        if (match == ">") {
          before = pos;
          return match;
        }
        let tmpText = text.slice(before, pos);
        before = pos;
        if (tmpText.indexOf("<") != -1)
          return match;
        return `<span_${color}>${p2}</span>`
      })
    }
    if (!AD_WORD_MARKS[options.ad_id])
      AD_WORD_MARKS[options.ad_id] = {};
    text = text.replace(COLOR_WRAP_SPAN, '<span step="" style="border-color:$1" class="WordBorderSolid">')
    AD_WORD_MARKS[options.ad_id][key] = text;
    return text;
  },
  getType: function (data) {
    return Bconf.getS(`common.type.${data.ad.type}.short_name`)
  },
  getLabelType: function (category, type) {
    let str = Bconf.getS(`lang_settings.code_message.1.${category}.${type}.vi.value`) ||
      Bconf.getS(`lang_settings.code_message.1.type.${type}.vi.value`)
    return str.replace("value:", "")
  },
  _formatPrice: function (price) {
    let length = price.length;
    if (length > 3) {
      return func._formatPrice(price.slice(0, length - 3)) + "," + price.slice(length - 3, length)
    }
    return price
  },
  findDiffEvent: function (e) {
    e.stopPropagation();
    let el = $(e.currentTarget);
    let q = this.another(this._key)._el;
    let value = el.text().trim()
    let l = func.find_text(el.text().trim(), q.val());
    if (typeof (l[0]) != "undefined") {
      if (this._key == "body") {
        $.scrollTo(q.parents(".body-area"), 100)
      }
      q.textrange("set", l[0], value.length)
      return
    }
    dsLog.error("Can not find \"" + m.text().trim() + '"')
  },
  initAdChanges: function (data) {
    data.new_params = {};
    data.new_actions_params = {}
    data.params = data.params || [];
    data.action_params = data.action_params || []
    for (let p of data.params) {
      data.new_params[p.name] = p.value
    }
    for (let p of data.action_params) {
      data.new_actions_params[p.name] = p.value
    }
    data.old_ad = _.extend({}, data.ad)
    data.old_params = _.extend({}, data.new_params)
    if (data.ad_change_params) {
      data.ad_change_params_map = {}
      for (let p of data.ad_change_params) {
        let param = p.name.replace("param_", "");
        if (param != p.name) {
          data.new_params[param] = p.new_value
          continue
        }
        data.ad[param] = p.new_value;

      }
    }
    // IMAGES
    func.initImage(data)

    // COMAPNY LOGO FOR JOB
    if (data.ad.category === '13010') {
      func.initComapnyLogo(data)
    }

    // PTY CATEGORY: pty_characteristics
    if (['1010', '1020', '1030', '1040', '1050'].includes(data.ad.category)) {
      const width = data.params.find(p => p.name === 'width');
      const length = data.params.find(p => p.name === 'length');
      const size = data.params.find(p => p.name === 'size');
      data.params.forEach((p, i) => {
        if (['width', 'length', 'size'].includes(p.name)) {
          data.params[i].value = !isNaN(data.params[i].value) ? +data.params[i].value : data.params[i].value;
        }
      })
      if (data.params && data.params.some(p => p.name === 'pty_characteristics')) {
        const ptyCharacteristics = data.params.find(p => p.name === 'pty_characteristics');
        const ptyCharacteristicsValue = ptyCharacteristics && ptyCharacteristics.value && ptyCharacteristics.value.split(',');
        ptyCharacteristicsValue.forEach(c => {
          if (mappingPtyCharacteristics[c]) {
            const key = mappingPtyCharacteristics[c] && mappingPtyCharacteristics[c].name;
            if (!data.params.some(p => p.name === key)) {
              data.params.push(mappingPtyCharacteristics[c]);
            }
          }
        });
      }
    }

    if (data.new_images && data.new_images.length) {
      data.ad.ad_has_images = true;
    }
  },
  initAdNotices: function (data) {
    //REFACTOR notices
    let new_notices = data.new_notices = {};
    if (data.notices && data.notices.length) {
      for (let p of data.notices) {
        if (p.uid) {
          p._type = 'usergroup';
          new_notices.usergroup = p;
          continue
        }
        if (p.user_id) {
          p._type = 'user';
          new_notices.user = p;
          continue
        }
        if (p.ad_id) {
          p._type = 'ad';
          new_notices.ad = p;
        }
      }
    }
    if (data.contact_notices && data.contact_notices.length) {
      for (let p of data.contact_notices) {
        p._type = p.notice_type;
        new_notices[p.notice_type] = p;
      }
    }
    for (let key in data.new_notices) {
      let notice = data.new_notices[key]
      if (notice.created_at) {
        notice.created_at = func.formatVietnamZone(notice.created_at)
      }
    }
  }
}
module.exports = func
