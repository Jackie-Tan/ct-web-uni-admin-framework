import cBase from 'meteor/chotot:platform-ctp/c-define/c-base.js';
const {ARRAY, REQUIRED} = cBase.TYPE;
var vfunc = {
    not(value) {
        return typeof value == 'undefined' || value === null ;
    },
    check(value, validator) {
        if (validator == ARRAY) {
            return value instanceof Array;
        }
        return typeof value == validator;
    }
}
class ctpField {
    constructor(autovalue, ...validators) {
        this._validators = validators;
        this._validators.push('undefined');
        this._autovalue = autovalue;
    }
    static of (autovalue, ...validators) {
        return new ctpField(autovalue, ...validators);
    }
    
    validator(value, data, ...keys) {
        for (let validator of this._validators) {
            if (validator == REQUIRED && vfunc.not(value)) {
                throw new Error(`this field is required at key:${keys}, value: ${value}, expected: required, parent:${JSON.stringify(data)}`);
            }
            if (vfunc.check(value, validator)) {
                return true;
            } 
        }

        throw new Error(`this field is wrong type at key:${keys}, value: ${value}, type: ${typeof value}, expected: ${this._validators}, parent:${JSON.stringify(data)}`);
    }
    get(value, data, ...keys) {
        this.validator(value, data, ...keys);
        if (vfunc.not(value)) {
            value = this._autovalue;
        }
        if (typeof value == 'function') {
            return '__('+value.toString()+')__end_func__';
        }
        return value;
        
    }
    desc(desc) {
        this._desc = desc;
        return this;
    }
    static load(data, base, point = '_component') {
        let obj = {};
        let fields = _.extend({}, base[point]);
        //check dynamic key (use one dkey in a object)
        let dkey = null; 
        for (let key in fields) {
            if (key.indexOf('_dkey_') == -1)
                continue;
            dkey = key;
            fields[dkey].next = dkey;
            break;
        }
        if (dkey) {
            for (let key in data) {
                if (fields[key]) {
                    continue;
                }
                fields[key] = fields[dkey];
            }
            delete fields[dkey];
        }
        for (let key in data) {
            let field = fields[key];
            if (!field) {
                logger.warn('[WARN] the field', key, 'at', point, 'is missing define, it will affect to crash app!');
                obj[key] = data[key];
                continue;
            }
            let value = field.get(data[key], data, point, key);
            if (vfunc.not(value)) 
                continue;
            obj[key] = value;
            if (typeof obj[key] == 'object' && obj[key] != null) {
                let next = point+'.'+ (field.next || key);
                if (base[next]) {
                    if (obj[key] instanceof Array) {
                        let newObj = [];
                        for (let objItem of obj[key]) {
                            newObj.push(ctpField.load(objItem, base, next));
                        }
                        obj[key] = newObj;
                    } else {
                        obj[key] = ctpField.load(obj[key], base, next);
                    }
                }
            }
        }
        return obj;
    }
}

module.exports = ctpField;