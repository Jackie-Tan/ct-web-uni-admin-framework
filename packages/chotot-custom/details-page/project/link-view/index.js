
const clsArray = [12,6,4];
Template.linkView.helpers({
  'views': function(){
    const instance = Template.instance();
    return this.views.get()
  },
  'linkTableClass': function(){
    return "col-md-2 col-xs-4"
  },
  'displayClass': function(){
    return 'col-md-12';
  },
  'heads': function(){
    return [
      {
        "key": "name",
        "text": "#Name",
        "input": {
          "type": "text"
        }
      }
    ]
  },
  'getValue': function(){
    const tpl = Template.instance();
    const formData = tpl.formData.get();
    if (!formData)
      return '';
    return formData[this.key]
  },
  'isInput': function(){
    return (this.input && this.input.enable !== false && this.input.isEdit !== false)
  },
  'isEditing': function(){
    const tpl = Template.instance();
    return tpl.isEditing.get();
  }
})
Template.linkView.onCreated(function(){
  this.formData = new ReactiveVar({});
  this.isEditing = new ReactiveVar(false);
})
Template.linkView.onRendered(function(){
  const id = this.data.id;
  const name = this.data.name;
  const instance = BaseTemplate.instances[name];
  if (!instance || !id){
    return;
  }
  const method = instance.method+'/GetById'
  const self = this;
  Meteor.call(method, id, function(error, result){
    if (error){
      dsLog.error(error.message);
      return;
    }
    self.formData.set(result.rows[0]);
  })
})
Template.linkView.events({
  'click .btn-remove': function(e,tpl){
    e.preventDefault();
    Modal.show('confirmModal', tpl.data)
  }
})
