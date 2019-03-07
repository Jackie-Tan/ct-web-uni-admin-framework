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
  