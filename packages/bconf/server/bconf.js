//1. init conf -> store __processing
//2. client get conf -> conf caching
//3. change conf -> trigger get new conf -> update conf caching -> update new version
//4. after conf change version -> client listien event change -> get conf -> conf caching

var {confOpts, runBconf, Bconf} = require('./init');
var updateVersion = function(id){
  let newVersion = Math.round(new Date()/1000);
  Confs.update({id}, {$set: {version: newVersion}}, {upsert: true});
};
var getConf = function(id, {stopOnMissConf} = {}) {
  const {cmd, key, address, addons = [], deltaVersion} = confOpts[id];
  try {
    console.log('getConf process...', id, confOpts[id]);
    let res = Meteor.wrapAsync(runBconf)(cmd, key, address);
    for (let addon of addons) {
      addon(res);
    }
    updateVersion('bconf', deltaVersion);
  } catch (e) {
    if (stopOnMissConf) {
      throw new Error(e);
    }
    logger.error(e);
  }
}

Meteor.methods({
  'Global/Trans/Bconf':function(){
    return Bconf.data;
  },
  'Global/Trans/BconfS':function(){
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
  getConf('bconf', {stopOnMissConf: true});
  getConf('bconfS', {stopOnMissConf: true});
  console.log('ok');
})
