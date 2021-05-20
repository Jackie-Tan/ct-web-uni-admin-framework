
const ImagesManager = require('meteor/study:form-widget/lib/chotot-upload')

Template.fileTemplateInput.helpers({
  'value': function () {
    return InputSchema.of().get();
  },
})
Template.fileTemplateInput.events({
  'click .remove-file': function(e, tpl) {
    InputSchema.of().set('');
    $("#file-template-input").val('');
  },
  'change input.file-upload':function (e, tpl) {
    //TODO check type and position
    const current = e.currentTarget;
    //TODO get image link
    let file = current.files[0];
    let inputIns = InputSchema.of();
    ImagesManager.gcsUpload(file)
      .then((resp) => {
        inputIns.set(resp.file_url);
      }).catch(err => {
        dsLog.error(`Upload file is not success, please contact tech for supporting`);
        $(current).val('');
      });
  }
})
