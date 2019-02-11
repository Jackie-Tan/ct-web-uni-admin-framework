Template.visibilityCol.helpers({
  'heads': function(){
    let result = [];
    let count = 0;
    for (let head of this.heads){
      if (head.isHidden) continue;
      head.index = count;
      result.push(head);
      count = count + 1;
    }
    return result;
  }
})
Template.visibilityCol.events({
  'click .table-col': function(e, tpl){
    e.preventDefault();
    const el = $(e.currentTarget);
    const index = el.data('index');
    const instance = BaseTemplate.of();
    const table = instance.table;
    const tableAPI = table.api();
    const visible = tableAPI.column( index ).visible();
    tableAPI.column( index ).visible(!visible);
  }
})
