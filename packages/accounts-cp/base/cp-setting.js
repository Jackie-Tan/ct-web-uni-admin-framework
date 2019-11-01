const Setting = require('./setting')
module.exports = {
  get: function () {
    const userId = Meteor.userId();
    const setting = Setting.of().findOne({ userId });
    return setting && setting.settings || null;
  },
  set: function (settings) {
    if (!settings) {
      return;
    }

    const userId = Meteor.userId();

    return Setting.of().update(
      { userId },
      { $set: { userId, settings } },
      { upsert: true, multi: false });
  }
}
