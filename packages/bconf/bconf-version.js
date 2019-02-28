confSchema = new SimpleSchema({
    'id': {
        type: String
    },
    'version': {
        type: Number
    },
  })

Confs = new Mongo.Collection('conf');
Confs.attachSchema(confSchema);
if (Meteor.isServer) {
    Confs.remove({});
    let time = Math.round(new Date()/1000);
    console.log(time);
    Confs.__caching = {
        bconf: time,
        bconfS: time,
    };
    Confs.__processing = {};
    Confs.insert({id: 'bconf', version: time});
    Confs.insert({id: 'bconfS', version: time});
}

Confs.deny({
    'insert': function(){
        return true;
    },
    'update': function(){
        return true;
    },
    'remove': function(){
        return true;
    },
});
  