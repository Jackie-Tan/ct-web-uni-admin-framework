Template.defaultInput.helpers({
    'required': function(){
        return {
            required: !this.isOptional
        };
    },
    'disabled': function(){
        return {
            disabled: this.isDisabled
        };
    }
})