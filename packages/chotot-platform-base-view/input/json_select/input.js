//STABLE
function isChangeData(curr, last) {
  if (curr.length == last.length) {
    let dataKey = {}
    for (let item of curr) {
      dataKey[item.key] = true;
    }
    for (let item of last) {
      if (!dataKey[item.key])
        return true
    }
    return false
  }
  return true
}
Template['json.selectInput'].onCreated(function () {
  this.tValue = new ReactiveVar([].concat(Array.isArray(this.data.value)? this.data.value: []));
  this.lastData = [];
  let self = this;
  let inputIns = this._inputIns= InputSchema.of();
  let schema = inputIns._schema;
  if (typeof self.data.input.ref == 'function') {
    self.autorun(function() {
      return self.data.input.ref.call(inputIns, {}, function (data) {
        if (!data || !Array.isArray(data))
          return
        if (!isChangeData(data, self.lastData))
          return
        data = data.map((i) => {
          if (typeof i == "string")
            return schema._schema[i];
          return i;
        })
        schema.scale(data)
        self.tValue.set(null)
        setTimeout(function () {
          self.tValue.set(data)
          self.lastData = data;
        }, 0)
      })
    })
  }
})

Template['json.selectInput'].helpers({
  'items': function () {
    return Template.instance().tValue.get()
  },
  "key": function() {
    return this._key || this.key
  }
})
