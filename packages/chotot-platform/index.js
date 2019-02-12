import Role from 'meteor/chotot:role/role.js';
Meteor.methods({
    'Global/GetConfig': function () {
        let respArr = [];
        const RoleIns = Role.of(this.userId);
        const mergeSort = require('meteor/chotot:common/sort.js');
        const {ORDER_UI} = require('meteor/chotot:platform-modules/config.js');
        for (let m in BaseTemplate.Instances) {
            try {
                RoleIns.pass('collection', m);
                respArr.push([m, BaseTemplate.getCache('config', m)]);
            } catch (e) {
                // console.log(m, 'not pass', e.message || e.reason);
            }
        }
        let resp = {};
        let sortSubModules = mergeSort(respArr, function (a, b) {
            let orderA = ORDER_UI[a[0]] || 1;
            let orderB = ORDER_UI[b[0]] || 1;
            return orderB >= orderA;
        })
        //sort main modules
        mergeSort(sortSubModules, function (a, b){
            let orderA = ORDER_UI[a[0].split('/')[0]] || 1;
            let orderB = ORDER_UI[b[0].split('/')[0]] || 1;
            return orderB >= orderA;
        })
        .forEach((i) => {
            resp[i[0]] = i[1];
        });
        return resp;

    }
})