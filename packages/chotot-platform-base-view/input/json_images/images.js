const ImagesManager = require('meteor/study:form-widget/lib/chotot-upload')
Template['json.imagesInput'].onCreated(function(){
  this.tValue = new ReactiveVar([].concat(Array.isArray(this.data.value)? this.data.value: []))
})

Template['json.imagesInput'].helpers({
  'value': function(){
    const tpl = Template.instance();
    return tpl.tValue.get().filter(function(item) {
      return item;
    });
  },
  'label': function(){
    const input = Template.instance().data.input;
    return this[input.label || 'type']
  },
  'properties': function(){
    const input = Template.instance().data.input;
    return input.properties;
  },
  'height': function () {
    const input = Template.instance().data.input;
    return (input.properties.length+1)*70 +'px';
  },
  'pKey': function(){
    const data = Template.instance().data;
    const input = data.input;
    return data.key+'.'+this;
  },
  'key': function () {
    return Template.instance().data.key
  },
  'url': function(){
    const input = Template.instance().data.input;
    return this[input.ref || 'url']
  },
  'pValue': function(){
    const value = Template.parentData();
    return value[""+this];
  },
  'isType': function(){
    return ""+this == "type"
  },
  'isPosition': function(){
    return ""+this == "position"
  },
  "typeInput": function () {
    return {
        options: [{
          "value": "OVERVIEW",
          "display": "OVERVIEW"
        },
        {
          "value": "SURROUNDING",
          "display": "SURROUNDING"
        },
        {
          "value": "PROCESS",
          "display": "PROCESS"
        },
        {
          "value": "FLOOR_PLAN_PROJECT",
          "display": "FLOOR_PLAN_PROJECT"
        },
        {
          "value": "FLOOR_PLAN_UNIT",
          "display": "FLOOR_PLAN_UNIT"
        },
        {
          "value": "SAMPLE_HOUSE",
          "display": "SAMPLE_HOUSE"
        },
        {
          "value": "FACILITIES",
          "display": "FACILITIES"
        }]
    }
  }
})
Template['json.imagesInput'].events({
  'click .widget': function(e, tpl){
    const value = tpl.tValue.get();
    value.push({url:"", type:"", "image_id":"", "caption":""} || {url:"", type:""})
    tpl.tValue.set(value);
  },
  'click .remove-images-div': function(e, tpl){
    const el = $(e.currentTarget);
    const index = el.data('index');
    const value = tpl.tValue.get();
    value.splice(index,1);
    tpl.tValue.set(value);
  },
  'change input.images-upload':function (e, tpl) {
    //TODO check type and position
    let current = e.currentTarget;
    let el = $(current).parents('.json-images-div');
    let iType = el.find('select[data-name="images.type"]').val();
    let iPosition = el.find('input[data-name="images.position"]').val();
    if (iType == "" || iPosition == "") {
      alert('you must enter type and position of the image!')
      //TODO remove the file
      $(current).val('');
      return
    }
    //TODO get image link
    let file = current.files[0];
    let project_id = Router.current().params.id || Template.parentData(6).id;
    let image_id = `${project_id}_${iType.toLowerCase()}_${iPosition}`.replace(/\s/g,"")
    ImagesManager.storeImage(file, {url: '/project-image-upload/'+image_id}).then(function (res) {
      res = res.url;
      if (res == "") {
        dsLog.error("Upload image is not success, please contact tech for supporting");
        $(current).val('');
        return
      }
      let resArr = res.split('/');
      let namespace = resArr[resArr.length-2];
      el.find('input[data-name="images.image_id"]').val(image_id);
      el.find('input[data-name="images.namespace"]').val(namespace);
      el.find('input[data-name="images.url"]').val(res)
    }).catch(err => {
      dsLog.error("Upload image is not success, please contact tech for supporting")
      $(current).val('');
    })


  }
})



Template['json.imagesCellOutput'].helpers({
  'data': function() {
    return Array.isArray(this.data)? this.data : [];
  },
  'url': function(){
    const input = Template.parentData().input;
    return this[input.ref || 'url']
  },
  'label': function(){
    const input = Template.parentData().input;
    return this[input.label || 'type']
  }
})