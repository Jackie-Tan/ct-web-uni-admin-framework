import Role from 'meteor/chotot:role/role.js'
Meteor.methods({
    'Global/GetConfig': function () {
        let resp = {};
        const RoleIns = Role.of(this.userId);
        for (let m in BaseTemplate.Instances) {
            try {
                RoleIns.pass('collection', m);
                resp[m] =BaseTemplate.getCache('config', m);
            } catch (e) {
                console.log(m, 'not pass', e.message || e.reason);
            }
        }
        return resp;
        

    }
})