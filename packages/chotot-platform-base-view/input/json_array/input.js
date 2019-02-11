Template['json.arrayInput'].onCreated(function () {
  this.tValue = new ReactiveVar([].concat(Array.isArray(this.data.value)? this.data.value: []))
})
Template['json.arrayInput'].helpers({
  'value': function(){
    const tpl = Template.instance();
    return tpl.tValue.get().filter(function(item) {
      return item;
    });
  },
  "newHeads": function () {
    const input = Template.instance().data.input;
    const parent = Template.parentData()
    let heads = input.heads
    let newHeads = []
    for (let head of heads){
      let newHead = _.extend({}, head)
      newHead.key = parent.key+'.'+head.key
      newHeads.push(newHead)
    }
    return newHeads
  },
  'heads': function () {
    const input = Template.instance().data.input;
    return input.heads;
  },
  'height': function () {
    const input = Template.instance().data.input;
    let heads = input.heads;
    return (heads.length+1)*70 +'px';
  },
  'getValue': function(){
    const value = Template.parentData();
    let keys = (this.key || "").split('.')
    if (keys.length)
      return value[keys[keys.length-1]];
    return ""
  }
})

Template['json.arrayInput'].events({
  'click .widget': function(e, tpl){
    const value = tpl.tValue.get();
    const input = tpl.data.input;
    const heads = input.heads;
    let list = {};
    for (let head of heads)
      list[head.key]=""
    value.push(list)
    tpl.tValue.set(value);
  },
  'click .remove-images-div': function(e, tpl){
    const el = $(e.currentTarget);
    const index = el.data('index');
    const value = tpl.tValue.get();
    value.splice(index,1);
    tpl.tValue.set(value);
  },
})