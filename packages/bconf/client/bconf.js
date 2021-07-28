const TIME_REFRESH = 1000 * 60 * 60;

function initBconfDB() {
  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }

  var openRequest = indexedDB.open('cp', 1);
  openRequest.onupgradeneeded = (e) => {
    let db = e.target.result;
    db.objectStoreNames.contains("bconf") || db.createObjectStore('bconf', {
      keyPath: 'name'
    });
  }
}

function getBconfD(cb) {
  Meteor.call('Global/Trans/Bconf', function (err, res) {
    if (err) {
      dsLog.error(err.message || err.reason);
      return;
    }
    // localStorage.setItem('BconfD', JSON.stringify(res))
    var openRequest = indexedDB.open('cp', 1)
    openRequest.onsuccess = () => {
      let store = openRequest.result.transaction("bconf", "readwrite").objectStore("bconf")
      var item = {
        name: 'BconfD',
        data: JSON.stringify(res),
        created: new Date().getTime()
      };
      store.put(item);
      Bconf.data = res;
      cb && cb();
    }
  })
}

function getBconfS(cb) {
  Meteor.call('Global/Trans/BconfS', function (err, res) {
    if (err) {
      dsLog.error(err.message || err.reason);
      return;
    }
    delete res.data;
    // localStorage.setItem('BconfS', JSON.stringify(res))
    var openRequest = indexedDB.open('cp', 1)
    openRequest.onsuccess = () => {
      let store = openRequest.result.transaction("bconf", "readwrite").objectStore("bconf");
      var item = {
        name: 'BconfS',
        data: JSON.stringify(res),
        created: new Date().getTime()
      };
      store.put(item);
      _.extend(Bconf, res);
      cb && cb();
    }
  })
}

function getBconfValue(key, cb) {
  var openRequest = indexedDB.open('cp', 1)
  openRequest.onsuccess = () => {
    let store = openRequest.result.transaction('bconf', 'readonly').objectStore("bconf");
    let getRequest = store.get(key);
    getRequest.onsuccess = function(event) {
      if (getRequest.result != null) {
        cb(getRequest.result.data);
      } else {
        cb(null);
      }
    };
  }
}

function setBconfValue(key, val) {
  var openRequest = indexedDB.open('cp', 1)
  openRequest.onsuccess = () => {
    let store = openRequest.result.transaction("bconf", "readwrite").objectStore("bconf");
    var item = {
      name: key,
      data: val,
      created: new Date().getTime()
    };
    store.put(item);
  }
}

Bconf = {
  versions: {
    bconf: new ReactiveVar(),
    bconfS: new ReactiveVar(),
  },
  data: null,
  dataS: null,
  init: function () {
    getBconfValue("BconfDVersion", function (data) {
      Bconf.versions.bconf.set(data);
    })

    getBconfValue("BconfSVersion", function (data) {
      Bconf.versions.bconfS.set(data);
    })

    getBconfValue("BconfD", function (data) {
      if (data) {
        Bconf.data = JSON.parse(data);
      }
      console.log('---loading dynamic config----');
      if (!Bconf.data) {
        console.log('----from server----');
        getBconfD();
      }
    });

    getBconfValue("BconfS", function (data) {
      if (data) {
        _.extend(Bconf, JSON.parse(data));
      }
      console.log('---loading static config----');
      if (!Bconf.dataS) {
        console.log('----from server----');
        getBconfS();
      }
    });
  },
  refresh() {
    Tracker.autorun(function () {
      Meteor.subscribe('conf', function () {
        let conf = Confs.find({
          id: 'bconf'
        }).fetch()[0];
        if (!conf)
          return;
        if (!Bconf.versions.bconf.curValue) {
          Bconf.versions.bconf.set(conf.version);
          setBconfValue("BconfDVersion", "" + conf.version)
          return;
        }
        if (Bconf.versions.bconf.curValue == conf.version) {
          return;
        }
        console.log('---reloading dynamic config----');
        //dynamic bconf no need refresh
        getBconfD(function () {
          Bconf.versions.bconf.set(conf.version);
          setBconfValue("BconfDVersion", "" + conf.version);
        });
        this.stop();
      });
    });
    Tracker.autorun(function () {
      Meteor.subscribe('conf', function () {
        let conf = Confs.find({
          id: 'bconfS'
        }).fetch()[0];
        if (!conf)
          return;
        if (!Bconf.versions.bconfS.curValue) {
          Bconf.versions.bconfS.set(conf.version);
          setBconfValue('BconfSVersion', "" + conf.version);
          return;
        }
        if (Bconf.versions.bconfS.curValue == conf.version) {
          return;
        }
        console.log('---reloading static config----');
        getBconfS(function () {
          Bconf.versions.bconfS.set(conf.version);
          setBconfValue('BconfSVersion', "" + conf.version);
        })
        this.stop();
      });
    });
  },
  baseGet: function (bKey, data) {
    let keys = ("" + bKey).split('.');
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
  get: function (bKey) {
    let version = Bconf.versions.bconf.get();
    return Bconf.baseGet(bKey, Bconf.data)
  },
  getS: function (bKey) {
    return Bconf.baseGet(bKey, Bconf.dataS)
  },
}

Meteor.startup(function () {
  initBconfDB();
  Bconf.init();
  Bconf.refresh();
  if (!window.Bconf) {
    window.Bconf = Bconf
  }
})