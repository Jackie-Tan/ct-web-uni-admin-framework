Meteor.methods({
    'Global/GetConfig': function () {
        return BaseTemplate.getCache('config');
    }
})