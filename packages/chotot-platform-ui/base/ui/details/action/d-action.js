var dActionIns = {}
class baseDAction {
  static of(schema_id, key, config) {
    if (dActionIns[schema_id] && dActionIns[schema_id][key])
      return dActionIns[schema_id][key]
    return new baseDAction(schema_id, key, config)
  }
  constructor(schema, key, config) {
    this._key = key
    this._config = config
    this._schema = schema
    this._tpl = Template.instance();
    this._schema_id = this._schema._id
    this._enable = new ReactiveVar(config.enable !== false)
    this.genId()
  }
  exportId() {
    Template.parentData(0).d_action_id = this._id;
    dsLog.debug(`export schema ${this._schema_id} d action ${this._key}`, Template.parentData(0))
  }
  genId(){
    if (!dActionIns[this._schema_id])
      dActionIns[this._schema_id] = {}
    if (!dActionIns[this._schema_id][this._key])
      dActionIns[this._schema_id][this._key] = []
    this._id =  {schema_id: this._schema_id, key: this._key}
    dActionIns[this._schema_id][this._key] = this
    this.exportId()
  }
  disable() {
    this._enable.set(false)
  }
  enable() {
    this._enable.set(true)
  }
  events(events, tpl) {
    if (!events)
      return
    const self = this
    let selector = this._tpl.$(`[data-daction="${this._key}"]`)
    for (let type in events) {
      this._tpl.$('.base-detail-action').on(type, selector, function(e) {events[type].call(self, e, tpl)})
    }
  }
}

module.exports = baseDAction