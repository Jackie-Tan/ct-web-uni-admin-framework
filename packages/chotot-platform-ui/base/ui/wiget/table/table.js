import TableData from './data';
const searchType = require('./search/search-type');
const MAP_DATA = function(input, data, full) {
  if (!input.map)
    return data;
  if (typeof input.map =='function')
    return input.map(data, full);
  return input.map[data];
}
const GET_NODE_FROM_META = function(meta) {
  let ins = meta.settings.oInstance;
  return ins.api().cell(meta.row, meta.col).node();
}
const SPECIAL_RENDER = function(tpl, obj, input) {
  if (!input)
    return;
  if (input.type != 'text' && Template[`${input.type}CellOutput`]) {
    obj.render = function (data, type, full, meta) {
      let node = GET_NODE_FROM_META(meta);
      setTimeout(function(){
        if (node.innerHTML)
          return;
        Blaze.renderWithData(Template.cellOutput, {
          type: input.type,
          data: MAP_DATA(input, data, full),
          input: input
        }, node);
      })
      return "";
    }
    return;
  }
  if (input.map) {
    obj.render = function(data, type, full, meta){
      return MAP_DATA(input, data, full)
    }
  }
}

Template.datatable.helpers({
  'heads': function(){
    return Template.instance().heads;
  },
  'instanceName': function(){
    return Template.parentData().name;
  }
})
Template.datatable.onCreated(function(){
  let result = [];
  let count = 0;
  for (let head of this.data.heads){
    if (head.isHidden) continue;
    head.index = count;
    result.push(head);
    count = count + 1;
  }
  this.heads = result;
})
Template.datatable.onRendered(function () {
  const tpl = this;
  tpl._renderByTemplate = [];
  setTimeout(function () {
    let columns = [];
    let instance = BaseTemplate.of()
    if (!instance){
      dsLog.error('did not load instance for the view '+tpl.data.name);
      return;
    }
    let config = instance._config;
    for (let head of tpl.heads) {
      if (head.notData) {
        columns.push({render: function(data, type, full, meta){
          full.actions = head.actions;
          let node = GET_NODE_FROM_META(meta);
          setTimeout(function(){
            if (node.innerHTML)
              return;
            Blaze.renderWithData(Template.buttonAction, full, node);
          })
          return "";
        }});
        continue;
      }
      let obj = {
        data: head.key,
        visible: head.isVisible !== false
      };
      if (head.width){
        obj.width = head.width;
      }
      SPECIAL_RENDER(tpl, obj, head.input);
      
      columns.push(obj);
    }
    let defaultSort = [0, 'desc'];
    instance._heads.map(function (item) {
      if (item.sort && item.sort.isDefault) {
        defaultSort = [item.index, item.sort.default]
      }
    })
    let tableOpts = {
      "order": [defaultSort],
      "columns": columns,
      "fixedColumns":   {
          "heightMatch": 'none'
      }};
    if (!config.clientData) {
      tableOpts.processing = true;
      tableOpts.serverSide = true;
      tableOpts.ajax = function(data, callback, settings){
        const options = {
          limit: settings._iDisplayLength,
          offset: settings._iDisplayStart,
          search: settings.oPreviousSearch.sSearch,
          columnSearch: []
        }
        if (settings.aaSorting.length && settings.aaSorting[0].length>1)
         options.sort = `${tpl.heads[settings.aaSorting[0][0]].key} ${settings.aaSorting[0][1].toUpperCase()}`;
        if (settings.aoPreSearchCols.length){
          for (let i =0; i < settings.aoPreSearchCols.length; i++){
            let search = settings.aoPreSearchCols[i].sSearch;
            let headSCursor = tpl.heads[i];
            if (search != "") {
              if (headSCursor.search && headSCursor.search.enable === false)
                continue;
              let sType = (headSCursor.search && headSCursor.search.type) || "default"
              let formatType = searchType[sType]
              if (!formatType) {
                formatType = searchType.default
              }
              options.columnSearch.push({ key: headSCursor.key, search: formatType(search)})
              continue;
            }
            if (headSCursor.search && headSCursor.search.default)
              options.columnSearch.push({key: headSCursor.key, search: headSCursor.search.default.value()})

          }
        }
        if (instance.data && !instance.data.checkOptionsChange(options))
          return instance.data.get(callback)
        instance.tbOptions = options;
        instance.post('Get', options, {silent: true}, function (err, res) {
          instance.setVar('data', new TableData(res, options));
          callback(res);
        });
      };
      instance.setVar('table', (tpl.$('.datatable').dataTable(tableOpts)));
      return;
    } 
    var tableIns = null;
    tpl.autorun(function(){
      config.clientData(function(data){
        tableOpts.data = data;
        instance.setVar('data', new TableData({data: tableOpts.data}));
        if (tableIns) {
          //TODO change data in client
          tableIns.api().clear().rows.add(data).draw();
          return;
        }
        tableIns = tpl.$('.datatable').dataTable(tableOpts);
        instance.setVar('table', tableIns);
      });
    })
   
      

   
  }, 0);
})