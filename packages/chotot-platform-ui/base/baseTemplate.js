
BaseTemplateIns= {};
class baseTemplate {
  constructor(name, config) {
    // create Blaze Template
    const prefix = config.prefix;
    const display = config.display;
    const heads = config.heads;
    const actions = config.actions;
    const details = name + 'Details';
    this.method = this._method = name;
    this.display = this._display = display;
    this.config = this._config = config;
    this.details = this._details = details;
    this.name = this._name = name;
    this.heads = this._heads = heads || [];
    this._schemas = [];
    this._dependencies = [];
    this._pings = {};

    if (Template[name]) {
      console.warn('template name is exists, it may be get wrong effect')
      return;
    }
    Template[name] = new Template("Template."+name, (function() {
      let view = this;                                                 // 3                                                                                                 // 4
      return Blaze._TemplateWith(function() {                                                                              // 5
        return {
          display:  Spacebars.call(display || name),                                                                                                    // 6
          name: Spacebars.call(name),                                                                                   // 7
          prefix: Spacebars.call(prefix),
          heads: heads,
          withTable: config.withTable !== false,
          actions: actions// 8
        };                                                                                                                 // 9
      }, function() {                                                                                                      // 10
        return Spacebars.include(view.lookupTemplate("baseTemplate"));                                               // 11
      });                                                                                                                  // 12
    }));
    if (!(config.details && config.details.custom === true))
    Template[details] = new Template("Template."+details, (function() {
      let view = this;                                                 // 3                                                                                                 // 4
      return Blaze._TemplateWith(function() {                                                                              // 5
        return {
          display:  Spacebars.call(display || name),                                                                                                    // 6
          name: Spacebars.call(name),                                                                                   // 7
          prefix: Spacebars.call(prefix),
          heads: heads,
          actions: actions// 8
        };                                                                                                                 // 9
      }, function() {                                                                                                      // 10
        return Spacebars.include(view.lookupTemplate("baseDetailsPage"));                                               // 11
      });                                                                                                                  // 12
    }));
    // create route + init schema for nochema control
    this._router  = '/'+ (config.router || config.display || name);
    this.addRoute(name, this._router, {action: function(){
      this.render(name)
    }})
    this._routerDetail = this._router + '/details/:id'
    this.addRoute(`${name}.details`, this._routerDetail, {action: function(){
      this.render(config.router_details || details)
    }})
    let moreRouter = this._config.more_router || {}
    for (let router_name in moreRouter) {
      this.addRoute(`${name}.${router_name}`, `${this._router}/${moreRouter[router_name].path || 'empty'}`, moreRouter[router_name])
    }

    //prebuild spacbar
    let schema = config.schema || {};
    for (let key in schema) {
      let aSchema = schema[key];
      if (aSchema.spacebar) {
        aSchema.key = aSchema.key || key;
      }
    }
    BaseTemplateIns[name] = this;
  }
  static of(tName) {
    let name;
    Tracker.nonreactive(function() {
      name = tName || Router.current().route.getName();
    });
    return name && (BaseTemplateIns[name] || BaseTemplateIns[name.split(".")[0]]) || null;
  }
  addRoute(name, route, render = {}) {
    let {action, custom} = render;
    Router.route(route , {
      name: name,
      action: action || function() {
        return this.render(`baseTemplateCustom`, custom)
      }
    });
  }
  post() {
    let method = BaseMethod.of(this._name)
    return method.post.apply(method, arguments)
  }
  setVar(property, table){
     this[property] = table;
  }
  reload(){
    this.data.options = {};
    this.table.fnReloadAjax();
    this.set('reload', (this.get('reload')|| 0) +1);
  }
  reloadWithId(raw_id){
    this.data.setUpdate(raw_id)
    this.table.fnDraw(false);
    let curr = this.get('reloadWithId') || {raw_id, trigger: 0};
    curr.trigger++;
    this.set('reloadWithId', curr);
  }
  reloadLastPage(){
    let self = this;
    this.set('reloadLastPage', (this.get('reloadLastPage')|| 0) +1);
    this.data.setUpdateCount(function(){
      let table = self.table.api().order( [ 0, 'asc' ] );
      if (table.page() === table.page('last').page()){
        self.data.options = {};
      }
      table.draw(false);
    });
    this.table.fnDraw(false);
  }
  static extendAction(name, func) {
    if (Actions[name]) {
      dsLog.error('define same action');
      return
    }
    Actions[name] = func
  }
  doAction(e, tpl) {
    const el = $(e.currentTarget);
    const dataAction = el.data('action');
    if (!dataAction)
        return
    const dataActionArr = dataAction.split('.');
    const action = dataActionArr.length ? dataActionArr[0] : dataAction;
    const id = el.data('id');
    if (Actions[action])
        return Actions[action](dataAction, {el, tpl, id});
    Actions.modal(dataAction, { el, tpl, id});
  }
  set(key, value) {
    if (!this._pings[key])
      return this._pings[key] = new ReactiveVar(value)
    this._pings[key].set(value)
  }
  get(key) {
    if (!this._pings[key])
      this._pings[key] = new ReactiveVar()
    return this._pings[key].get()
  }
  clearDependency() {
    for (let d of this._dependencies) {
      d.destroy();
    }
  }
  addDependency(component) {
    if (typeof component.destroy != 'function') {
      console.log('need add destroy function for', component);
      component.destroy = function(){};
    }
    this._dependencies.push(component);
  }
  clearSchema() {
    this._schemas = [];
  }
  addSchema(schema) {
    this._schemas.push(schema)
  }
  getFirstSchema() {
    if (this._schemas.length) {
      return this._schemas[0];
    }
    console.error('miss schema in this template');
    return {};
  }
}

var Actions = {
  'bool': function (dataAction, info = {}) {
    let {el, id} = info;
    const dataActionArr = dataAction.split('.');
    const actionType = dataActionArr.length? dataActionArr[1]: dataAction;
    const actived = el.data('actived');
    BaseTemplate.of().post('Update', [{id: id}, {[actionType]: !actived}], function () {
      BaseTemplate.of().data.findById(id)[actionType] = !actived;
      const classToggle = !actived
        ? 'fa-check'
        : 'fa-times';
      el.data('actived', !actived);
      el.find('i').removeClass('fa-check').removeClass('fa-times').addClass(classToggle)
    })
  },
  'modal': function (dataAcion, info) {
    let {el, tpl, id} = info;
    const modal = el.data('modal');
    Modal.show("ctWrap", {
        // attr: {class: 'modal fade'},
        schema_id: BaseTemplate.of().getFirstSchema()._id,
        template: modal,
        data: _.extend({id}, (id && BaseTemplate.of().data.findById(id) || {})),
        schema_attr: { class: 'modal-dialog'}
    });
  }
}


BaseTemplate = baseTemplate
BaseTemplate.instances = BaseTemplateIns
