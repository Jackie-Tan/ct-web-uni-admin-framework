const TIME_REFRESH = 1000 * 60 * 60;
const BCONFS_REFRESH_INTERVAL = 600000;


function getBconfD(cb) {
  Meteor.call('Global/Trans/Bconf', function (err, res) {
    if (err) {
      dsLog.error(err.message || err.reason);
      return;
    }
    localStorage.setItem('BconfD', JSON.stringify(res))
    Bconf.data = res;
    cb && cb();
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
    _.extend(Bconf, res);
    cb && cb();
  })
}

function refreshBconfS(cb) {
  Meteor.call('Global/Trans/BconfS/Refresh', function (err, res) {
    if (err) {
      dsLog.error(err.message || err.reason);
      return;
    }
    // localStorage.setItem('BconfS', JSON.stringify(res))
    delete res.data;
    _.merge(Bconf, res);
    cb && cb();
  })
}

Bconf = {
  versions: {
    bconf: new ReactiveVar(),
    bconfS: new ReactiveVar(),
  },
  data: null,
  dataS: null,
  init: function () {
    Bconf.versions.bconf.set(localStorage.getItem('BconfDVersion'));
    // Bconf.versions.bconfS.set(localStorage.getItem('BconfSVersion'));
    if (lbconfD = localStorage.getItem('BconfD')) {
      Bconf.data = JSON.parse(lbconfD);
    }
    // if (lbconfS = localStorage.getItem('BconfS')) {
    //   _.extend(Bconf, JSON.parse(lbconfS));
    // }
    console.log('---loading dynamic config----');
    if (!Bconf.data) {
      console.log('----from server----');
      getBconfD();
    }
    console.log('---loading static config----');
    if (!Bconf.dataS) {
      console.log('----from server----');
      getBconfS();
    }
  },
  refresh() {
    Tracker.autorun(function () {
      Meteor.subscribe('conf', function () {
        let conf = Confs.find({id: 'bconf'}).fetch()[0];
        if (!conf)
          return;
        if (!Bconf.versions.bconf.curValue) {
          Bconf.versions.bconf.set(conf.version)
          localStorage.setItem('BconfDVersion', "" + conf.version);
          return;
        }
        if (Bconf.versions.bconf.curValue == conf.version) {
          return;
        }
        console.log('---reloading dynamic config----');
        //dynamic bconf no need refresh
        getBconfD(function () {
          Bconf.versions.bconf.set(conf.version);
          localStorage.setItem('BconfDVersion', "" + conf.version);
        });
        this.stop();
      });
    });
    setInterval(function() {
      console.log('---reloading static config----');
      refreshBconfS()
      this.stop();
    }, BCONFS_REFRESH_INTERVAL);
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
  Bconf.init();
  Bconf.refresh();
  if (!window.Bconf) {
    window.Bconf = Bconf
  }
})
