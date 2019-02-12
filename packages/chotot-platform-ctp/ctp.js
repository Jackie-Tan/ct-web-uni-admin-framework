var ins = {};
import cBase from  './c-define/c-base';
import ctpComponent from './ctp-component';
// var ctpVersion = new Mongo.Collection('ctp');
// Meteor.publish('ctpVersion', function() {
//     return ctpVersion.find({});
// });

class ctp {
    constructor(name) {
        this._name = name;
        this._components = {};
        this._depends = [];
        this._ready = false;
        this._ignore = false;
        ins[this._name] = this;
    }
    static of(name) {
        let insCheck = ins[name];
        if (insCheck)
            return insCheck;
        return new ctp(name);
    }
    Component(component, more = []) {
        let addons = [['defType', cBase.of('component')]].concat(more);
        return ctpComponent.of(this, component, addons).get();
    }
    Template(template = {}, more = {}) {
        let dcTemplate = cBase.of('template');
        let defMore = [];
        if (more.template) {
            defMore = [['defMore', more.template]];
        }
        logger.warn('ctp validator for ', template._context);
        let vTemplate = ctpComponent.of(this, template, defMore.concat([['defType', dcTemplate]])).get();
        for (let field in vTemplate) {
            if (dcTemplate._func[field]) {
                vTemplate[field] = dcTemplate._func[field].call(this, vTemplate[field], more.component);
            }
        }
        return vTemplate;
    }
   
    static list() {
        let result = []
        for (let key in ins) {
            result.push(ins[key]);
        }
        return result;
    }
}
module.exports = ctp;