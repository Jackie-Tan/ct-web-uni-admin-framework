import ctpField from 'meteor/chotot:platform-ctp/ctp-field';
import cBase from './c-base';
const {BOOLEAN, STRING, NUMBER, OBJECT, ARRAY, FUNCTION, REQUIRED} = cBase.TYPE;

var base = cBase.of('component');
base._component = {
    isInput: ctpField.of(null, BOOLEAN).desc('define component type , is Input view or not'),
    schema_wrap: ctpField.of(null, OBJECT).desc('define an input will be in schema wrap'),
    metadata: ctpField.of(null, STRING).desc('define component type , currently we support view and input'), 
    key: ctpField.of(null, STRING).desc('define a key'), //
    use_view: ctpField.of(null, BOOLEAN).desc('if the input is disabled it will be a view'),
//PARENT KEY
    isBlock: ctpField.of(null, BOOLEAN).desc('(in ui), the component using span view-bound will bound its children component '),
    isBreak: ctpField.of(null, BOOLEAN).desc('in ui, the component using div with class in displayClass to bound its children component'),
    displayClass: ctpField.of(null, STRING).desc('support for isBreak'),
    isLoop: ctpField.of(null, BOOLEAN).desc('ex: v1 isLoop, when we use forInFor that key, it will run a loop v1.a, v1.b ....'),
    initData: ctpField.of(null, FUNCTION).desc('reformat data before transfer to its children'),

//STYLE I
    width: ctpField.of(null, STRING).desc('in Style I, width of col'),
    notSearch: ctpField.of(false, BOOLEAN).desc('in Style I, filter by column will be disable by this props'),
    actions: ctpField.of(null, ARRAY).desc('in Style I, for key action only, that show action for a row'),
    search: ctpField.of(null, OBJECT).desc('in Sytle I, for custom filter a column'),
    notData: ctpField.of(null, BOOLEAN).desc(''),
    autoValue: ctpField.of(null, FUNCTION, STRING, ARRAY, OBJECT, BOOLEAN, NUMBER).desc('auto Value if null'),
    sort: ctpField.of(null, OBJECT).desc('sort options for a col'),

    isHidden: ctpField.of(null, BOOLEAN).desc('=== true will be only use in server'), // 
    isVisible: ctpField.of(null, BOOLEAN).desc('=== false, must be show by remove hide class'), //
    isOptional: ctpField.of(null, BOOLEAN).desc('=== false, it will be not require in form'), //
    isDisabled: ctpField.of(null, BOOLEAN).desc('disbled this component, but can trigger to enable'),

    text: ctpField.of(null, STRING).desc('for label in input form'),
    input: ctpField.of(null, OBJECT).desc('ui configuration'), // implement below
    events: ctpField.of(null, ARRAY).desc('list events will change state value of this component'),
    run: ctpField.of(null, OBJECT).desc('list function when using inputRun(_component_key_in_schema, _run_key) helpers. each function will use context is this component'),

    clean: ctpField.of(null, FUNCTION).desc('reformat data of the component before send to server'),
    spacebar: ctpField.of(null, OBJECT).desc('spacebar builder support'),
    onInput: ctpField.of(null, OBJECT).desc('event handle by selector'), // implement below
    onView: ctpField.of(null, OBJECT).desc('event handle by selector'), // implement below
};
base['_component.input'] = {
    rootClass: ctpField.of(null, FUNCTION).desc('class in '),
    boundClass: ctpField.of(null, STRING).desc('class before input form'),
    displayClass: ctpField.of(null, STRING).desc(''),
    labelClass: ctpField.of(null, STRING).desc('class bound lable in input form'),
    hide: ctpField.of(null, BOOLEAN).desc('the componet using style display none'),

    enable: ctpField.of(null, BOOLEAN).desc('show but disable this but util change from another ref'),
    type: ctpField.of('text', STRING).desc('identify type'),
    kind: ctpField.of(null, STRING).desc('force define kind of the componet (ojson, oarray)'),
    subtype: ctpField.of(null, STRING).desc('if have type, its data is subtype type'),
    ref: ctpField.of(null, ARRAY, FUNCTION, OBJECT, STRING).desc('reference value. It depends on your component'), //ref is reference data for this input 
    placeHolder: ctpField.of(null, STRING),
    options: ctpField.of(null, ARRAY).desc('list {display:"", value:""} for select '), 

    map: ctpField.of(null, FUNCTION, OBJECT).desc("map value show in datatable"),

    isEdit: ctpField.of(null, BOOLEAN).desc('it will/not show in schema having data'),
    isAdd: ctpField.of(null, BOOLEAN).desc('it will/not show in schema without data'),
    
    pong: ctpField.of(null, FUNCTION).desc('listen event from another component and do action here'),
    pongView: ctpField.of(null, FUNCTION).desc('using same pong when the componet not have isInput'),
    value: ctpField.of(null, FUNCTION),
    display: ctpField.of(null, FUNCTION), //state for display
    validate: ctpField.of(null, FUNCTION).desc('the func validate value after changed'),
    action: ctpField.of(null, ARRAY).desc('define span action right of input'),

    width: ctpField.of(null, STRING).desc('config key for some component type, that will change width'),
    heads: ctpField.of(null, ARRAY).desc('for json.array components -> list components'),
    default: ctpField.of(null, OBJECT).desc('for date components, set default value'),

    label: ctpField.of(null, STRING).desc('json.images component props'),
    properties: ctpField.of(null, OBJECT).desc('json.images component props'),
    refClass: ctpField.of(null, STRING).desc('radio components, refClass'),
    max: ctpField.of(null, NUMBER).desc('textarea components, max words'),
    placeholder: ctpField.of(null, STRING).desc('text input components, when without text'),
   
    defaultValue: ctpField.of(null, STRING, NUMBER).desc('autocomplete components, default value'),
    refId: ctpField.of(null, FUNCTION).desc('autocomplete components, find autocomplete for specific value'),
    
    fromToday: ctpField.of(null, BOOLEAN).desc('date components, enable value just only from today'),
    disabledDates: ctpField.of(null, BOOLEAN),
    date_opts: ctpField.of(null, BOOLEAN).desc('date components, datetimepickerjs opts')
};
//Event listener for Input
base['_component.onInput'] = {
    _dkey_event: ctpField.of(null, OBJECT).desc('Declare event in the input'),
};
base['_component.onInput._dkey_event'] = {
    _dkey_selector: ctpField.of(null, FUNCTION).desc('_dkey_event to selector will do this function')
};

//Event listener for View
base['_component.onView'] = {
    _dkey_event: ctpField.of(null, OBJECT).desc('Declare event in the input'),
};
base['_component.onView._dkey_event'] = {
    _dkey_selector: ctpField.of(null, FUNCTION).desc('_dkey_event to selector will do this function')
};

//spacebar

base['_component.spacebar'] = {
    css: ctpField.of(null, STRING),
    kind: ctpField.of(null, STRING),
    type: ctpField.of(null, STRING),              //optional but specify for a special template (input, action ..)
    html: ctpField.of(null, STRING),    //in handlebar form, it can be inherit from a component
    data: ctpField.of(null, OBJECT),       //bind data to html spacebar
    init: ctpField.of(null, FUNCTION),            //onCreated this template
    ready: ctpField.of(null, FUNCTION),          //onRendered this template
    events: ctpField.of(null, OBJECT),
};
base['_component.spacebar.data'] = {
    _dkey_helper: ctpField.of(null, FUNCTION),
};


base['_component.sort'] = {
    isDefault: ctpField.of(null, BOOLEAN).desc('set default'),
    default: ctpField.of(null, REQUIRED, STRING).desc('desc or asc by this col'),
}
// base['_component.schema_wrap'] = {
//    name: ctpField.of(null, REQUIRED, STRING).desc('metadata name'),
//    opt: ctpField.of(null, FUNCTION).desc('change current schema'),
// };
// base['_component.schema_wrap.opt'] ={
//     schema: ctpField.of(null, OBJECT).desc('replace parent schema'),
//     heads: ctpField.of(null, ARRAY).desc('add more heads for this schema'),
//     methods: ctpField.of(null, ARRAY).desc('list allows functions')
// };

module.exports = base;