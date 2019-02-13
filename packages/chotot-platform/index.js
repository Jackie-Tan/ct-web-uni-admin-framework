import Role from 'meteor/chotot:role/role.js';
Meteor.methods({
    'Global/GetConfig': function () {
        let resp = {};
        const RoleIns = Role.of(this.userId);
        const mergeSort = require('meteor/chotot:common/sort.js');
        const {ORDER_UI} = require('meteor/chotot:platform-modules/config.js');
        const configList = BaseTemplate.getCache('config');
        for (let m in  configList) {
            try {
                RoleIns.pass('collection', m);
                resp[m] = configList[m]
            } catch (e) {
                // console.log(m, 'not pass', e.message || e.reason);
            }
        }
        return resp;
    }
})