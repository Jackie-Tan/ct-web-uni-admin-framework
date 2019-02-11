var SpaceBarsIns = {};
const REQUIRED_PARAMS = {
    "html": "string",
}
const getKeyPt = /key="(.*)"/g
function isInfLoop(html) {
    while (regex = getKeyPt.exec(html)) {
        key = regex[1].trim();
        if (SpaceBarsIns[key]) {
            throw new Error('please check spacebar config. that will be inf loop!')
        }
    }
    return false
}


module.exports = function(templateName, aSchema, schemaKey){

    let spaceBarConfig = aSchema.spacebar;
    for (let key in REQUIRED_PARAMS) {
        if (typeof spaceBarConfig[key] != REQUIRED_PARAMS[key]) {
            throw new Error(`wrong type ${key} in spacebar config`)
        }
    }
    if (typeof spaceBarConfig.type == 'undefined' && typeof schemaKey == 'undefined') {
        throw new Error(`need 1 key type of key input for identify this spacebar`);
    }
    let type = spaceBarConfig.type;
    let nameByType = !type? `${templateName}&${schemaKey}ViewCustom`: type;
    let tName = this._tName = `${nameByType}`;
    if (SpaceBarsIns[tName] || Template[tName])
        return tName;
    SpaceBarsIns[tName] = true;     
    let html = spaceBarConfig.html.replace(/(\/\/ [0-9]{1,9})/g,"");
    isInfLoop(html);
    //TODO gather all css in schema
    let css = spaceBarConfig.css;
    if (css) {
        cssStyle = document.createElement( 'style' );
        cssStyle.textContent = css;
        document.head.appendChild(cssStyle);
    }
    spaceBarConfig.html = ' ';
    let renderFuncStr = SpacebarsCompiler.compile(html, {isTemplate: true});
    let renderFunc = eval(renderFuncStr)
    let iName =  `${tName}WithoutData`;
    Template[iName] = new Template(`Template.${iName}`, renderFunc);
  
    if (!spaceBarConfig.data) {
        Template[tName] = new Template(`Template.${tName}`, renderFunc); 
    } else {
        Template[tName] = new Template(`Template.${tName}`, (function() {
            let view = this;    
            let currentInput = this.templateInstance()._inputIns;   
            if (!currentInput)
                return;
            let currentSpacebar = currentInput._oConfig.spacebar;                                                                                                                           
            return Blaze._TemplateWith(function() {  
                let tData = {};
                for (let key in currentSpacebar.data) {
                    let item = currentSpacebar.data[key]
                    if (typeof item == 'function') {
                        tData[key] = item.bind(currentInput);
                        continue;
                    }
                    tData[key] = item;
                    
                }                                                                          
                return tData;                                                                                                
            }, function() {                                                                                                     
            return Spacebars.include(view.lookupTemplate(iName));                                               
            });                                                                                                                 
        }));
    }
    Template[tName].onCreated(function(){
        let currentInput = this._inputIns = InputSchema.of();
        if (!currentInput)
            return;
        let currentSpacebar = currentInput._oConfig.spacebar;
        if (currentSpacebar && typeof currentSpacebar.init == 'function') {
            currentSpacebar.init.call(currentInput)
        }
    })  
    Template[tName].onRendered(function(){
        let currentInput = this._inputIns;
        if (!currentInput)
            return;
        let currentSpacebar = currentInput._oConfig.spacebar;
        if (currentSpacebar && typeof currentSpacebar.ready == 'function') {
            currentSpacebar.ready.call(currentInput)
        }
    }) 
    if (spaceBarConfig.events)
        Template[tName].events(spaceBarConfig.events);  
    return tName;
}