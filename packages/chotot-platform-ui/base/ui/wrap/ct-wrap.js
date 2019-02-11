Template.ctWrap.helpers({
    'template': function() {
        return Template.parentData().template;
    },
    'usingSchema': function() {
        let template = Template.parentData().template || ".";
        let templateSplit = template.split('.');
        if (templateSplit[0] == "schema") {
            return true;
        }
    },
    "key": function() {
        let template = Template.parentData().template || ".";
        let templateSplit = template.split('.');
        return templateSplit[1];
    },
    'templateData': function() {
        return Template.parentData().data;
    }
})