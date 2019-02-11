Template.viewSchema.onCreated(function(){
   try {
    let opt = this.data.opt || {};
    opt.data = opt.data || this.data.opt_data;
   this.viewIns = ViewSchema.of(BaseSchema.of()._id, this.data.key, this, opt);
   } catch (e) {
     console.error(`config error at schema`, BaseSchema.of()._id)
   }
})
Template.viewSchema.helpers({
  'value': function () {
    let tpl = Template.instance();
    let value = tpl.viewIns.get();
    return typeof value == "string" && Spacebars.SafeString(value.replace(/(\/\/ [0-9]{1,9})/g,"")) || value;
  },
  'displayClass': function () {
    return Template.instance().viewIns.getDisplayClass()
  },
  'boundClass': function () {
    return Template.instance().viewIns.getBoundClass()
  },
  "rootClass": function() {
    return Template.instance().viewIns.getRootClass()
  },
  'type': function () {
    return Template.instance().viewIns._type
  },
  'input': function () {
    return Template.instance().viewIns._input
  },
  'text': function () {
    return Template.instance().viewIns._oConfig.text
  },
  "show": function () {
    return Template.instance().viewIns.isShow()
  },
  "style": function() {
    return Template.instance().viewIns.getStyle()
  }
})
Template.viewSchema.onDestroyed(function () {
  this.viewIns.destroy()
})