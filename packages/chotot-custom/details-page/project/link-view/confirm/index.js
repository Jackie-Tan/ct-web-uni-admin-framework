
import link from '../../lib/link.js'
Template.confirmModal.events({
  'click .btn-yes': function(e, tpl){
    Session.set('isLoadingScreen', true);
      const data = {
        project_id: Router.current().params.id,
        [tpl.data.to]: tpl.data.id
      }
      const method = BaseTemplate.instances[tpl.data.parentName].method+'/RemoveLink';
      dsLog.info('[CALL] '+method);
      Meteor.call(method, tpl.data.index, data, function(error, result){
        Session.set('isLoadingScreen', false);
        if (error){
          dsLog.error(error.message);
          return;
        }
        tpl.$('.hide-modal').click();
        dsLog.success('success!');
        link.instance.reload(tpl.data.index)
      });
  }
})
