class Setting {
  constructor () {
    const settingSchema = new SimpleSchema({
      'userId': {
        type: String,
        index: true,
        unique: true,
      },
      'settings': {
        type: Object,
        blackbox: true,
      }
    });

    const Setting = new Mongo.Collection('user_settings');
    Setting.attachSchema(settingSchema);
    return Setting;
  }
  static of(){
    if (Ins) {
      return Ins;
    }
    Ins = new Setting()
    return Ins
  }
}


var Ins = null

module.exports = Setting
