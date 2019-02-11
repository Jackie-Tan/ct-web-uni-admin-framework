var Schema = new SimpleSchema({
  is_actived: {
    type: Boolean,
    autoValue: function(){
      if (typeof this.value === 'undefined' || this.value === null)
        return true;
    }
  },
  is_deleted: {
    type: Boolean,
    autoValue: function(){
      if (typeof this.value === 'undefined' || this.value === null)
        return false;
    }
  },
  created_at: {
    type: String,
    autoValue: function() {
      return moment().utc().format('YYYY-MM-DD hh:mm:ss.SSSSSS')
    }
  },
  updated_at: {
    type: String,
    autoValue: function() {
      return moment().utc().format('YYYY-MM-DD hh:mm:ss.SSSSSS')
    }
  }
});


module.exports = Schema;
