class cBase {
    constructor(name) {
        this._name = name;
        cBase.Instances[name] = this;
        return this;
    }
    static of(name) {
        if (cBase.Instances[name])
            return cBase.Instances[name];
        return new cBase(name);
    }
    extend(defMore) {
        let newBase = this;
        for (let key in defMore) {
            if (newBase[key]) {
                let newBKey = _.extend({}, newBase[key]);
                newBase[key] = newBKey;
                for (let newDef in defMore[key]) {
                    if (newBase[key][newDef]) {
                        logger.error('conflict extend key at', key, newDef)
                        continue;
                    }
                    newBase[key][newDef] = defMore[key][newDef];
                }
                continue;
            }
            newBase[key] = defMore[key];
        }
        return newBase;
    }
}
cBase.Instances = {};
cBase.TYPE = {
    BOOLEAN: 'boolean',
    STRING: 'string',
    NUMBER: 'number',
    OBJECT: 'object',
    FUNCTION: 'function',
    ARRAY: 'array',
    REQUIRED: 'required',
    METHOD_ALLOWS: 'method_allows'
}

module.exports = cBase