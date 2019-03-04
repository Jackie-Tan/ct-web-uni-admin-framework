var {confOpts, runBconf, Bconf} = require('./init');
var updateVersion = function(id, INIT_TIME = 3){
  let newVersion = Math.round(new Date()/1000);
  let oldVerion = Confs.findOne({id}).version;
  //oldVersion can be inited by another instance -> we will using oldVersion in less than 2 minutes
  let delta = (newVersion - oldVerion)/60;
 
  if (delta < INIT_TIME) {
    Confs.__caching[id] = oldVerion;
    return;
  }
  Confs.__caching[id] = newVersion;
  Confs.update({id}, {$set: {version: newVersion}});
}
var getConf = function(id) {
  Confs.__processing[id] = true;
  const {cmd, key, address, addons = [], deltaVersion} = confOpts[id];
  try {
    console.log('getConf process...', id, confOpts[id]);
    let res = Meteor.wrapAsync(runBconf)(cmd, key, address);
    for (let addon of addons) {
      addon(res);
    }
    updateVersion('bconf', deltaVersion);
  } catch (e) {
    logger.error(e);
  }
  Confs.__processing[id] = false;
}
var isHavingNewVersion = function (id) {
  if (Confs.__processing[id]) {
    return false;
  }
  return Confs.__caching[id] != Confs.findOne({id}).version
}


Meteor.methods({
  'Global/Trans/Bconf':function(){
    if (isHavingNewVersion('bconf')) {
      getConf('bconf');
    }
    return Bconf.data;
  },
  'Global/Trans/BconfS':function(){
    if (isHavingNewVersion('bconfS')) {
      getConf('bconfS');
    }
    return Bconf
  },
  'Global/Trans/Bconf/Refresh': function() {
    getConf('bconf');
  },
  'Global/Trans/BconfS/Refresh': function() {
    getConf('bconfS');
  },
})
Meteor.publish('conf', function(){
  return Confs.find({});
})

Meteor.startup(function(){
  console.log('waiting config');
  getConf('bconf');
  getConf('bconfS');
  console.log('ok');
})
