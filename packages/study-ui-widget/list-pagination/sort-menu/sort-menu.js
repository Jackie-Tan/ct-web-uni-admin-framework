Template.sortMenu.helpers({
    'isSelectedInSort': function () {
        var id = this._id;
        var SS = Session.get('cb_sort_' + this.field + '_' + id);
        if (SS)
            return 'selected'
    }
});
Template.sortMenu.events({
    'click .cb-sort-pagination': function (e, tml) {
        e.preventDefault();
        var id = tml.data._id;
        var target = $(e.currentTarget);
        var field = target.data('field');
        var ss = 'cb_sort_' + field + '_' + id;
        var currentSS = Session.get(ss);
        if (typeof currentSS != "undefined")
            Session.set(ss, {
                value: -currentSS.value,
                updatedAt: new Date()
            });
        else
            Session.set(ss, {
                value: 1,
                updatedAt: new Date()
            });
    }
});