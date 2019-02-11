var getSort = function (id) {
  var sort = {};
  var sortType = Const.sortType[id];
  Tracker.nonreactive(function () {
    sortType = QuickSort(sortType, function (a, b) {
      var aa = Session.get('cb_sort_' + a.field + '_' + id);
      var bb = Session.get('cb_sort_' + b.field + '_' + id);
      if (typeof bb == "undefined") {
        return true
      }
      if (typeof aa == "undefined") {
        return false;
      }
      return (new Date(aa.updatedAt) > new Date(bb.updatedAt))
    });
  });
  var length = sortType.length;
  for (var i = 0; i < length; i++) {
    var field = sortType[i].field;
    var SS = Session.get('cb_sort_' + field + '_' + id);
    sort[field] = sortType[i].default;
    if (SS) {
      sort[field] = SS.value
    }
  }
  return sort;
}
Template.cbPaginationShow.onCreated(function () {
  this.cData = new ReactiveVar([]);
  this.cLength = new ReactiveVar(0);
});
Template.cbPaginationShow.onRendered(function () {
  let self = this;
  let parent = Template.parentData();
  this.autorun(function () {
    if (parent.reload)
      parent.reload.get()
    let data = self.data;
    let opt = data.opt || {}
    opt.limit = data.max;
    let selected = 1;
    if (data.selected) {
      selected = data.selected.get()
    }
    opt.offset = data.max*(selected-1);
    if (data.method) {
      return Meteor.call(data.method, opt, function (err, res) {
        if (err) {
          console.error(err.reason)
          return
        }
        self.cData.set(res.data)
        self.cLength.set(res.length)
      })
    }
    let listData = data.list.get();
    if (listData && listData.length) {
      self.cLength.set(listData.length)
      self.cData.set(listData.slice(opt.offset, opt.offset + opt.limit))
    }
  })
})
Template.cbPaginationShow.helpers({
  'getData': function () {
    let tpl = Template.instance()
    return tpl.cData.get()
  },
  'getLengthData': function () {
    let tpl = Template.instance();
    return tpl.cLength.get()
  },
});

Template.cbPagination.onCreated(function(){
  let data = Template.parentData();
  this.selected = new ReactiveVar(1);
  data.selected = this.selected;
})
Template.cbPagination.helpers({
  'isSelected': function (index) {
    let tpl = Template.instance()
    return tpl.selected.get() == index;
  },
  'previousIndex': function () {
    let tpl = Template.instance()
    let index = tpl.selected.get() - 1;
    if (index <= 0)
      return false;
    return index;
  },
  'getNumByIndex': function () {
    return this.index;
  },
  'nextIndex': function () {
    let tpl = Template.instance()
    let page = Math.ceil(this.num / this.max);
    let index =  tpl.selected.get() + 1;
    if (index > page)
      return false;
    return index;
  },
  getPagination: function () {
    let page = Math.ceil(this.num / this.max);
    let list = [];
    for (let i = 0; i < page; i++) {
      list.push({index: i + 1});
    }
    return list;
  }
});

Template.cbPagination.events({
  'click .cb-pagination': function (e, tpl) {
    e.preventDefault();
    let target = $(e.currentTarget);
    let index = parseInt(target.data('index'));
    tpl.selected.set(index);
  }

})


