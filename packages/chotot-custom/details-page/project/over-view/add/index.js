import link from '../../lib/link.js'
import GetData from  'meteor/study:form-widget'


Template.addLinkTable.helpers({
  'linkTable': function(){
    return link.instance.linkTable;
  },
  'heads': function(){
    const tpl = Template.instance();
    return tpl.heads.get();
  },
  'isInput': function(){
    return (this.input && this.input.enable !== false && this.input.isAdd !== false)
  },
  'currentInstance': function () {
    return Template.instance().data.name;
  }
})
Template.addLinkTable.onCreated(function(){
  this.heads = new ReactiveVar([]);
  this.linkIndex = null;
})

Template.addLinkTable.events({
  'change .check-link-table': function(e, tpl){
    const el = $(e.currentTarget);
    const index = el.data('index');
    tpl.linkIndex = index;
    tpl.heads.set(link.instance.getAddHeads(parseInt(index)));
  },
  'submit form': function(e, tpl){
    e.preventDefault();
    if (tpl.linkIndex == null)
      return false;
    Session.set('isLoadingScreen', true);
    GetData.inForm(tpl, { useBH: false },function(err, data){
      if (err){
        dsLog.error(err);
        return;
     }
      data.project_id = Router.current().params.id;
      const method = BaseTemplate.instances[tpl.data.name].method+'/AddLink';
      dsLog.info('[CALL] '+method);
      Meteor.call(method, tpl.linkIndex, data, function(error, result){
        Session.set('isLoadingScreen', false);
        if (error){
          dsLog.error(error.message);
          return;
        }
        tpl.$('.hide-modal').click();
        dsLog.success('success!');
        link.instance.reloadAll()
      })
    });

  }
})
