const optionsFunc = {
    "sort": {
        "get": function(){
            if (!this._data)
                return `${this._columns[0]} DESC`;
            let parse = this._data.split(' ');
            let col = parse[0];
            let order = parse[1];
            if (this._column_key[col])
                return this._data;
            return `${this._columns[0]} ${order}`;
        }
    },
    "list": {
        "get": function(){
            if (!this._data)
                return [];
           return this._data.map((i) => {
            if (!this._column_key[i.key])
                return null;
            return i;
           }).filter((i) => {
               return i;
           })
        }
    }
}

class TBOptions {
    constructor(data, type, columns) {
        this._data = data;
        this._type = type;
        this._columns = columns;
        this._column_key = {};
        for (let col of columns) {
            this._column_key[col] = col;
        }
    }
    get() {
        return optionsFunc[this._type].get.call(this);
    }
}
module.exports = TBOptions;