import ctpField from './../ctp-field';
import cBase from './c-base';
const {
    BOOLEAN,
    STRING,
    NUMBER,
    OBJECT,
    ARRAY,
    FUNCTION,
    REQUIRED
} = cBase.TYPE;
var base = cBase.of('template');
base._component = {
    _context: ctpField.of(null, OBJECT).desc('field auto gen by modules and submodules structure'),
    //
    alias: ctpField.of(null, STRING),
    hidden: ctpField.of(false, BOOLEAN),
    icons: ctpField.of('fa-tasks', STRING),

    prefix: ctpField.of(null, REQUIRED, STRING),
    display: ctpField.of(null, REQUIRED, STRING),
    roles: ctpField.of(null, REQUIRED, ARRAY),
    attr: ctpField.of(null, OBJECT).desc('attr for redirect, check the object below'),
    redirect: ctpField.of(null, STRING).desc('url to redirect when click to the module'),
    router: ctpField.of(null, STRING).desc("custom router for this module"),
    href: ctpField.of(null, STRING).desc('custom href to another route when clicking this module'),
    router_details: ctpField.of(null, STRING).desc('custom router details when click an item'),
    details: ctpField.of(null, OBJECT).desc('config for details page'),
    
    
    layout: ctpField.of('mainLayout', STRING).desc('preload layout for this module'),
    preload: ctpField.of(null, FUNCTION).desc('preload lib for this module'),

    datatable: ctpField.of(null, OBJECT).desc('datatable ui config'),
    db_env: ctpField.of(null, STRING).desc('define ENV using db'),
    table: ctpField.of(null, STRING).desc('table using simple interface get, insert, update, import, export'),
    tableView: ctpField.of(null, STRING).desc('for custom table data by creat a view in postges data'),
    heads: ctpField.of(null, ARRAY).desc('define cols in the table or api'),
    actions: ctpField.of([], ARRAY).desc('list actions in below module in style I'),
    exportCSVHeads: ctpField.of(null, ARRAY).desc('define list heads to export CSV'),
    baseSchema: ctpField.of([], ARRAY).desc('list col autoValue when insert or update'),
    api_client: ctpField.of(null, OBJECT).desc('replace postgres db to API client interface'),
    api_env: ctpField.of(null, STRING).desc('add this.api_env to base ApiClient'),
    clientData: ctpField.of(null, FUNCTION).desc('caching all data (of datatable in style I) from sever to client, listen change by  reactive var'),
    tracking: ctpField.of(null, OBJECT).desc('enable tracking when insert to update to action_historys'),
    col_id: ctpField.of(null, STRING, ARRAY).desc('unique value by column or columns for update'),

    withTable: ctpField.of(true, BOOLEAN).desc('by default, we use module style I (table)'),
    schema: ctpField.of(null, OBJECT).desc('define component for the module'),
    iRegister: ctpField.of([], ARRAY).desc('list internal, public urls that user have permission for this module can use'),

    initData: ctpField.of(null, FUNCTION).desc('reformat data before show the schema '),

    roles_config: ctpField.of(null, OBJECT).desc('custom key to compare user and config permision'),
    actions_config: ctpField.of(null, OBJECT).desc('set permission for action in styleI')
};

base['_component.attr'] = {
    target: ctpField.of(null, STRING).desc('ex: _blank, the target when click rediect. check more <a> for details')
}
base['_component.datatable'] = {
    "bigSearch": ctpField.of(null, BOOLEAN).desc('if is false will remove search all cols')
},
base['_component.api_client'] = {
    "name": ctpField.of(null, REQUIRED, STRING).desc('name of api (check in api folder)'),
    "url": ctpField.of("", STRING).desc('replace add api env to client'),
}

base['_component.iRegister'] = {
    method: ctpField.of(null, REQUIRED, STRING).desc('method for request this Internal tag'),
    url: ctpField.of(null, REQUIRED, STRING).desc('url for request this Internal tag'),
    tag: ctpField.of(null, REQUIRED, STRING).desc('replace for keep permission for this module')
}
base['_component.roles_config'] = {
    user: ctpField.of(null, REQUIRED, STRING).desc('user key'),
    conf: ctpField.of(null, REQUIRED, STRING).desc('conf key')
};
base['_component.actions_config'] = {
    _dkey_action_conf: ctpField.of(null, OBJECT).desc('action that set permisison')
};
base['_component.actions_config._dkey_action_conf'] = {
    role: ctpField.of(null, REQUIRED, NUMBER).desc('define role for an action'),
    isFull: ctpField.of(null, BOOLEAN).desc('true is get All Data while send to server (for action "edit" only)'),
};
base._func = {
    // context is the ctp Template
    schema: function(components = {}, more = null) {
        for (let k in components) {
            let c = components[k];
            //validator
            let defMore;
            if (more) {
                defMore = [['defMore', more]];
            }
            components[k] = this.Component(c, defMore);
        }
        return components;
    },
    heads: function (components = [], more = null) {
        let self = this;
        let defMore = [];
        if (more) {
            defMore = [['defMore', more]];
            console.log(defMore);
        }
        return components.map((c) => {
            //the key in head will be the key in schema 
            return self.Component(c, 
                defMore.concat(
                    [['defMore', {
                        _component: {key: ctpField.of(null, REQUIRED, STRING)}
                    }]]
                )
            );
        });
    }
};
module.exports = base;