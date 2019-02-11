import ctpField from './ctp-field'
import {BOOLEAN,
    STRING,
    OBJECT,
    ARRAY,
    FUNCTION,
    REQUIRED} from 'meteor/chotot:platform-ctp/c-define/c-base';

Tinytest.add('I need validate a filed must be required', test => {
    key = ctpField.of(null, REQUIRED);
    try {
        key.get();
        test.isTrue(false);
    } catch (e) {
        test.isNotNull(e);
    }
})
Tinytest.add('I need validate a filed must be required and type is boolean', test => {
    key = ctpField.of(null, REQUIRED, BOOLEAN);
    try {
        key.get('true');
        test.isTrue(false);
    } catch (e) {
        test.isNotNull(e);
    }
})
Tinytest.add('I need validate a filed must be required and type is boolean but input right', test => {
    key = ctpField.of(null, REQUIRED, BOOLEAN);
    try {
        key.get(true);
        test.isTrue(true);
    } catch (e) {
        test.isNull(e);
    }
})

Tinytest.add('I need validate a optinal field and type is string ', test => {
    key = ctpField.of(null, STRING);
    try {
        key.get();
        test.isTrue(true);
    } catch (e) {
        test.isNull(e);
    }
})
Tinytest.add('I need validate a optinal field and type is string but wrong type', test => {
    key = ctpField.of(null, STRING);
    try {
        key.get(true);
        test.isTrue(false);
    } catch (e) {
        test.isNotNull(e);
    }
})
Tinytest.add('I need validate a optinal field and type is string and right type', test => {
    key = ctpField.of(null, STRING);
    try {
        key.get('text');
        test.isTrue(true);
    } catch (e) {
        test.isNull(e);
    }
})

Tinytest.add('load level 1', test => {
    var base = {};
    base._component = {
        text: ctpField.of(null, STRING),
        input: ctpField.of(null, OBJECT)
    };
    try {
        let inputData = {
            text: 'text',
            input: {
                type: 'text'
            }
        };
        let newData = ctpField.load(inputData, base);
        test.equal(newData, inputData);
    } catch (e) {
        test.isNotNull(e);
    }
})

Tinytest.add('load level 2', test => {
    var base = {};
    base._component = {
        text: ctpField.of(null, STRING),
        input: ctpField.of(null, OBJECT)
    };
    base.input = {
        type: ctpField.of('text', STRING)
    };
    try {
        let inputData = {
            text: 'text',
            input: {
                type: 'text'
            }
        };
        let newData = ctpField.load(inputData, base);
        test.equal(newData, inputData);
    } catch (e) {
        test.isNull(e);
    }
})
Tinytest.add('load level 2 wrong type', test => {
    var base = {};
    base._component = {
        text: ctpField.of(null, STRING),
        input: ctpField.of(null, OBJECT)
    };
    base.input = {
        type: ctpField.of('text', STRING)
    };
    try {
        let inputData = {
            text: 'text',
            input: {
                type: true
            }
        };
        ctpField.load(inputData, base);
        test.isTrue(false);
    } catch (e) {
        test.isNotNull(e);
    }
})

Tinytest.add('load level 2 and have dynamic key', test => {
    var base = {};
    base._component = {
        text: ctpField.of(null, STRING),
        input: ctpField.of(null, OBJECT)
    };
    base.input = {
        type: ctpField.of('text', STRING),
        _dkey_is: ctpField.of(null, BOOLEAN),
        ref: ctpField.of(null, ARRAY, FUNCTION)
    };
    try {
        let inputData = {
            text: 'text',
            input: {
                type: 'text',
                key_1: true,
                key_2: false
            }
        };
        let newData = ctpField.load(inputData, base);
        test.equal(newData, inputData);
    } catch (e) {
        test.isNull(e);
    }
})

Tinytest.add('load level 2 and have dynamic key wrong type', test => {
    var base = {};
    base._component = {
        text: ctpField.of(null, STRING),
        input: ctpField.of(null, OBJECT)
    }
    base.input = {
        type: ctpField.of('text', STRING),
        _dkey_is: ctpField.of(null, BOOLEAN),
        ref: ctpField.of(null, ARRAY, FUNCTION)
    };
    try {
        let inputData = {
            text: 'text',
            input: {
                type: 'text',
                key_1: 'text'
            }
        };
        ctpField.load(inputData, base);
        test.isTrue(false);
    } catch (e) {
        test.isNotNull(e);
    }
})

Tinytest.add('load level 3 and have dynamic key in dynamic_key right', test => {
    var base = {};
    base._component = {
        text: ctpField.of(null, STRING),
        input: ctpField.of(null, OBJECT)
    }
    base.input = {
        type: ctpField.of('text', STRING),
        _dkey_is: ctpField.of(null, OBJECT),
        ref: ctpField.of(null, ARRAY, FUNCTION)
    };
    base.input_dkey_is = {
        _dkey_is_2: ctpField.of(null, OBJECT)
    };
    base.input_dkey_is_dkey_is_2 = {
        key_lv_3: ctpField.of(null, BOOLEAN)
    }
    try {
        let inputData = {
            text: 'text',
            input: {
                type: 'autocomplete',
                key_1: {
                    key_2: {
                        key_lv_3: true,
                        key_3: 'ignore',

                    }
                }
            }
        };
        let newData = ctpField.load(inputData, base);
        delete inputData.input.key_1.key_2.key_3;
        test.equal(newData, inputData);
        test.isTrue(true);
    } catch (e) {
        test.isNull(e);
    }
})

Tinytest.add('load level 3 and have dynamic key in dynamic_key wrong type', test => {
    var base = {};
    base._component = {
        text: ctpField.of(null, STRING),
        input: ctpField.of(null, OBJECT)
    }
    base.input = {
        type: ctpField.of('text', STRING),
        _dkey_is: ctpField.of(null, OBJECT),
        ref: ctpField.of(null, ARRAY, FUNCTION)
    };
    base.input_dkey_is = {
        _dkey_is_2: ctpField.of(null, OBJECT)
    };
    base.input_dkey_is_dkey_is_2 = {
        key_lv_3: ctpField.of(null, BOOLEAN)
    }
    try {
        let inputData = {
            text: 'text',
            input: {
                type: 'autocomplete',
                key_1: {
                    key_2: {
                        key_lv_3: 'text',
                    }
                }
            }
        };
        ctpField.load(inputData, base);
        test.isTrue(false);
    } catch (e) {
        test.isNotNull(e);
    }
})
