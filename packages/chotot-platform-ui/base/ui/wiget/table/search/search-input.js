Template.searchInput.helpers({
  'notSearch': function(){
    const data = Template.parentData();
    return data.search && data.search.enable === false;
  },
  'getTemplate': function(){
    const data = Template.parentData();
    let type = 'input';
    if (data.search && data.search.type)
      return data.search.type + 'SearchInput'
    return type +'SearchInput'
  },
  'getData': function(){
    const data = Template.parentData();
    data.instanceName = this.instanceName;
    data.defaultValue = "";
    if (data.search && data.search.default)
      data.defaultValue = data.search.default.string || data.search.default.string()
    return data;
  }
})

Template.selectSearchInput.events({
  'change select': function(e, tpl){
    const el = $(e.currentTarget);
    const value = el.val();
    const index = tpl.data.index;
    const instance = BaseTemplate.of();
    const tableAPI = instance.table.api();
    const column = tableAPI.column(index);
    if (column.search() == value)
      return;
    column.search(value).draw();
  }
})
Template.inputSearchInput.events({
  'change input': function(e, tpl){
    const el = $(e.currentTarget);
    const value = el.val();
    const index = tpl.data.index;
    const instance = BaseTemplate.of();
    const tableAPI = instance.table.api();
    const column = tableAPI.column(index);
    if (column.search() == value)
      return;
    column.search(value).draw();
  }
})

Template.dateSearchInput.events({
  'change input': function(e, tpl){
    const el = $(e.currentTarget);
    const value = el.val();
    const index = tpl.data.index;
    //Process data
    const vArr = value.trim().replace(/\s{2,}/g,' ').split(' ');
    let query = {
      type: 'datetime'
    }
    vArr.map(function (item) {
      let pos = [">","=", "<"].indexOf(item)
      if (pos == -1) {
        return
      }
      const nextItem = vArr[pos+1];
      if (new Date(nextItem).toString() == 'Invalid Date') {
        dsLog.error('wrong format date at position after '+ item)
        return
      }
      if (item == '=') {
        query.min = nextItem;
        query.max = nextItem;
        return
      }
      if (query.min || query.max)
        return
      if (item == '>') {
        return query.min = nextItem
      }
      query.max = item[nextItem]
    })
    if (!query.min && !query.max)
      return;
    if (tpl.data.search && tpl.data.search.subtype == 'number') {
      if (query.min) query.min = new Date(query.min) / 1000;
      if (query.max) query.max = new Date(query.max) / 1000;
      query.subtype = 'number'
    }
    const instance = BaseTemplate.of();
    const tableAPI = instance.table.api();
    const column = tableAPI.column(index);
    try {
      const currentSearch = JSON.parse(column.search()) || {}
      if (currentSearch.min == query.min && currentSearch.max == query.max)
        return;
    } catch (e) {
    }
    column.search(JSON.stringify(query)).draw();
  }
})
Template.boolSearchInput.helpers({
  'placeholder': function () {
    return this.search.placeholder || this.text
  }
})
Template.boolSearchInput.events({
  'change input': function(e, tpl){
    const el = $(e.currentTarget);
    let value = el.val();
    value = tpl.data.search.map && tpl.data.search.map(value)
    if (value === null)
      return
    const index = tpl.data.index;
    const instance = BaseTemplate.of();
    const tableAPI = instance.table.api();
    const column = tableAPI.column(index);
    if (column.search() == value)
      return;
    column.search(value).draw();
  }
})