


import Role from 'meteor/chotot:role/role.js'
Meteor.methods({
  'Global/GetNav': function(){
    const adminModules = require('meteor/chotot:platform-modules');
const ORDER = adminModules.const.ORDER || {};
const ORDERBY = adminModules.const.ORDERBY || {};
    const Nav = Navigation.items.home.children;
    const RoleIns = Role.of(this.userId);
    return Nav.map(function(item, index){
      newItem = _.extend({index}, item);
      if (item.children && item.children.length)
        newItem.children = item.children.filter(function(child){
          try {
            return RoleIns.pass('collection', child.id) 
          } catch (e) {
            return false;
          }
        }).sort(function(a, b) {
          let pAlias = ORDERBY[item.alias] || {};
          let aAlias = pAlias[a.alias] || -1;
          let bAlias = pAlias[b.alias] || -1;
          return aAlias - bAlias;
          
        });
      return newItem;
    }).filter(function(item){
      return item.children.length;
    }).sort(function(a,b){
      return (ORDER[a.alias] || -1) - (ORDER[b.alias] || -1);
    })
  }
})
