import ctpField from './ctp-field';
var Selectors = {
    addon: {}
};
class ctpComponent {
    constructor(ctp, component, addons = []) {
        this._ctp = ctp;
        this._raw_component = component;
        if (!(addons instanceof Array)) {
            throw new Error('addons must be an arrays');
        }
        //inherit addon 
        let sAddon = Selectors.addon[this.selector()];
        if (sAddon){
            addons = addons.concat(sAddon);
        }
        for (let addon of addons) {
            let key = addon[0];
            let addonFunc = 'addon_'+key;
            if (typeof this[addonFunc] != 'function') {
                throw new Error(key + ' addon is not exists!');
            }
            if (!Selectors[key])
                Selectors[key] = {};
            try {
                this[addonFunc].apply(this, addon);
            } catch(e) {
                logger.warn(`addon ${addonFunc} in ${this._ctp._name} have error`, e);
            }
        }
    }
    static of (ctp, component, addons) {
        // if (ctp._compmonets[component.key])
        //     throw new Error('this component is exists');
        return new ctpComponent(ctp, component, addons);
    }
    get() {
        return ctpField.load(this._raw_component, this._def);
    }

    
    selector() {
        return 'metadata:' + (this._raw_component.metadata);
    }
    storeAddon(func, config = {}) {
        let selectors = config.selector || [];
         //for repeat addon by selector
        for (let selector of selectors) {
            if (!Selectors.addon[selector])
                Selectors.addon[selector] = [];
            Selectors.addon[selector].push([func, config]);
        }
    }
    storeSelector(func, config, newBase) {
        let selectors = config.selector || [];
        for (let selector of selectors) {
            if (Selectors[func][selector]) {
                throw new Error('this selector was defined! '+selector);
            }
            //for caching addon result
            Selectors[func][selector] = newBase;
        }
    }
    addonResult(func) {
        return Selectors[func][this.selector()];
    }
    

    //addon-defination -------------------

    addon_defType(func, def) {
        this._def = def;
    }
    addon_defMore(func, defMore) {
        let result = this.addonResult(func);
        if (result) {
            this._def = result;
            return;
        }
        let newBase = _.extend({}, this._def);
        for (let key in defMore) {
            if (newBase[key]) {
                let newBKey = _.extend({}, newBase[key]);
                newBase[key] = newBKey;
                for (let newDef in defMore[key]) {
                    newBase[key][newDef] = defMore[key][newDef];
                }
                continue;
            }
            newBase[key] = defMore[key];
        }
        this.storeSelector(func, defMore, newBase);
        this.storeAddon(func, defMore);
        this._def = newBase;
    }
    addon_init(func, mConfig) {
        if (typeof mConfig.init != 'function') {
            throw new Error('init function is require');
        }
        this.storeAddon(func, mConfig);
        mConfig.init.call(this);
    }
}


module.exports = ctpComponent;