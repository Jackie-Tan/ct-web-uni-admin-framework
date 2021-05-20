
const ImagesManager = require('meteor/study:form-widget/lib/chotot-upload')

Template.fileTemplateInput.helpers({
  'value': function () {
    return InputSchema.of().get();
  },
})
Template.fileTemplateInput.events({
  'click .remove-file': function(e, tpl) {
    InputSchema.of().set('');
  },
  'change input.file-upload':function (e, tpl) {
    //TODO check type and position
    let current = e.currentTarget;
    //TODO get image link
    let file = current.files[0];
    let inputIns = InputSchema.of();
    console.log('inputIns', inputIns);
    console.log('tpl', tpl);
    console.log('file', file);
    // let bucket = tpl.data.instanceName || 'other'
    // ImagesManager.sendS3(file, {url: '/s3-upload/'+bucket}).then(function (res) {
    //   inputIns.set(res.url);
    // }).catch(err => {
    //   dsLog.error(`Upload image ${file.name} is not success, please contact tech for supporting`)
    //   $(current).val('');
    // })
    ImagesManager.gcsUpload(file)
      .then((resp) => {
        console.log('image manager gcs', resp);
        // inputIns.set(resp.image_url);
      }).catch(err => {
        console.log('error upload image logo', err);
        dsLog.error(`Upload image ${file.name} is not success, please contact tech for supporting`)
        $(current).val('');
      });
  }
})
