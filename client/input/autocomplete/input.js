


Template.autocompleteInput.onCreated(function(){
  this.query = "";
  this.reload = new ReactiveVar();
})

var getColumnQuery = function(config, query){
  if (config.columnQuery)
    return config.columnQuery;
  let search = [];
  config.cols.map(function(item){
    search.push(({ key: item, search: ""+query}))
  })
  return search;
}
var autocompleteInternal =  function (config, query, callback) {
  if (!config || !config.table){
    return callback([])
  }
  if (config.driver || !config.value || !config.cols){
    return callback([])
  }
  const options = {
    limit: 100,
    offset: 0,
    columnQuery: getColumnQuery(config, query)
  }
  BaseMethod.of(config.table).post('Get', options, {silent: true}, function(err, res) {
    if (res.data)
      callback(res.data.map(function(resItem){
        let string = "";
        config.cols.map(function(item){
          string += (resItem[item] + " ")
        })
        return { value: resItem[config.value], name: string};
      }));
  })
}
Template.autocompleteInput.onRendered(function(){
  const self = this;

  let inputIns = InputSchema.of()
  const config = inputIns._input.ref;
  this.$('.typeahead').typeahead({
    source: function(query, callback) {
      self.autorun(function(){
        if (self.query == query)
          return;
        self.query = query
        if (typeof config == 'function') {
          return config.call(inputIns, query, callback)
        }
        autocompleteInternal(config, query, callback)
      })
    },
    autoSelect: true,
    hiddenEL: this.$('.typeahead-value'),
    matcher: function () {
      //for server-side query
      return true;
    },
    items: "all"
  });
  this.$(`[data-name="${this.data.key}"]`).val(this.data.value);
  this.$('.typeahead').val(this.data.display || this.data.value);
  //internal
  var setValue = inputIns.__refSet = function (data) {
    if (data.length) {
      inputIns.set(data[0].value)
      self.$('.typeahead').val(data[0].name);
    }

  }
  this.$('input.typeahead').on('change', function(e){
    let el = $(e.currentTarget);
    if (el.val() == "") {
      inputIns.forceSet(inputIns._input.defaultValue || "");
      return;
    }
  })

  if (typeof inputIns._input.refId == 'function') {
    return inputIns._input.refId.call(inputIns, inputIns.get(), setValue)
  }
  autocompleteInternal(config, inputIns.get(), setValue)

})