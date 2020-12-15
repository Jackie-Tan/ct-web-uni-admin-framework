
const ImagesManager = require('meteor/study:form-widget/lib/chotot-upload')

Template.logoInput.helpers({
  'value': function () {
    return InputSchema.of().get()
  },
})
Template.logoInput.events({
  'click .remove-icon': function(e, tpl) {
    InputSchema.of().set('');
  },
  'change input.images-upload':function (e, tpl) {
    //TODO check type and position
    let current = e.currentTarget;
    //TODO get image link
    let file = current.files[0]
    let inputIns = InputSchema.of();
    if (tpl.data.input && typeof tpl.data.input.ref == 'function') {
      let refResult = {}
      try {
         refResult = tpl.data.input.ref.call(inputIns, {file: file})
      } catch (e) {
        dsLog.error(e.message)
      }
      return ImagesManager.sendFile(refResult.formData, refResult.options).then(function (res) {
        inputIns.set(res[refResult.id]);
      }).catch(err => {
        console.warn(err);
        dsLog.error(`Upload image ${file.name} is not success, please contact tech for supporting`)
        $(current).val('');
      })
    }
    // let bucket = tpl.data.instanceName || 'other'
    // ImagesManager.sendS3(file, {url: '/s3-upload/'+bucket}).then(function (res) {
    //   inputIns.set(res.url);
    // }).catch(err => {
    //   dsLog.error(`Upload image ${file.name} is not success, please contact tech for supporting`)
    //   $(current).val('');
    // })
    ImagesManager.irisUpload(file)
      .then((resp) => {
        inputIns.set(resp.image_url);
      }).catch(err => {
        console.log('error upload image logo', err);
        dsLog.error(`Upload image ${file.name} is not success, please contact tech for supporting`)
        $(current).val('');
      });
  }
})
