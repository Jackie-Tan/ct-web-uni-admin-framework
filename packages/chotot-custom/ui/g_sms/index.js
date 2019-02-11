

import GetData from 'meteor/study:form-widget'
Template.g_smsCustom.onCreated(function () {
  this.isMultiple = new ReactiveVar(false)
  this.formData = new ReactiveVar({})
  this._config = BaseTemplate.of()._config;
})
Template.g_smsCustom.helpers({
  'isMultiple': function () {
    return Template.instance().isMultiple.get()
  },
  'getData': function () {
    return Template.instance().formData
  },
  'getValue': function () {
    let data = Template.instance().formData.get()
    if (!data.length)
      return data[this.key]
  },
  'headsNormal': function () {
    let config = Template.instance()._config;
    return [
      config.schema['message-text'],
      config.schema['account_ids'],
      config.schema['is_active']
    ]
  },
  'headsActive': function () {
    let config = Template.instance()._config;
    return [
      config.schema['is_active']
    ]
  }
})
Template.g_smsCustom.events({
  'click .input-type': function (e, tpl) {
    if ($(e.currentTarget).val() == "2") {
      if (!tpl.formData.get().length)
        tpl.formData.set([]);
      return tpl.isMultiple.set(true)
    }
    return tpl.isMultiple.set(false)
  },
  'click .btn-action': function (e, tpl) {
    const el = $(e.currentTarget);
    const dataAction = el.data('action');
    const dataActionArr = dataAction.split('.');
    const action = dataActionArr.length? dataActionArr[0]: dataAction;
    const id = el.data('id');
    const modal = el.data('modal');
    Modal.show(modal, $.extend(tpl.data, {id: id, action: action}));
  },
  'change input[type=file]': function (e, tpl) {
    
    Session.set('isLoadingScreen', true);
    setTimeout(function () {
      Session.set('isLoadingScreen', false);
    },1000)
    GetData.parseCSV($(e.currentTarget), function(result){
      let data = result.data;
      if (!data || !data.length)
        return dsLog.error('Sai format phone ',result);
      if (!data[data.length-1].phone)
        data.pop()
      if (data[0].message) {
        tpl.formData.set(data);
        tpl.isMultiple.set(true)
        return
      }
      tpl.isMultiple.set(false)
      tpl.formData.set({account_ids: data.map(function (item) {
        return item.phone
      })})
    })
  },
  'submit form': function(e, tpl){
    let config = tpl._config;
    e.preventDefault();
    Session.set('isLoadingScreen', true);
    setTimeout(function () {
      Session.set('isLoadingScreen', false);
    },1000)
    const method = baseTemplate.instances[tplName].method + '/SendSMS';
    var doSend = function (list) {
      list.map(function (item) {
        Meteor.call(method, {
          phone: item.phone,
          content: item.message
        }, function (error, result) {
          if (error) {
            dsLog.error(error.message + ' in ' + item);
            return;
          }
          tpl.$('.hide-modal').click();
          dsLog.success('send success!');
        })
      })
    };
    if (!tpl.isMultiple.get()) {
      GetData.inForm(tpl, {useBH: true}, function (err, data) {
        if (err) {
          dsLog.error(err);
          return;
        }
        dsLog.info('[CALL] ' + method);
        doSend(data.account_ids.split(',').map(function (item) {
          return {phone: item, message: data.message}
        }))
      });
      return
    }
    let is_active = GetData.inInput(tpl.$('[data-name=is_active]'));
    let msg = config.schema['is_active'].input.validate(is_active);
    if (msg) {
      dsLog.error(msg);
      return;
    }
    let data = tpl.formData.get()
    if (!data || !data.length) {
      dsLog.error('Miss data for sending sms');
      return;
    }
    for (let item of data) {
      let msg = config.schema['phone'].input.validate(item.phone);
      if (msg) {
        dsLog.error(msg +' in ' +item.phone);
        return;
      }
      msg = config.schema['message-col'].input.validate(item.message);
      if (msg) {
        dsLog.error(msg +' in ' +item.phone);
        return;
      }
    }
    doSend(data);
    return false;
  }
})