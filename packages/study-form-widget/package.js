Package.describe({
  summary: 'Study Form Widget',
  version: '0.0.1',
  name: 'study:form-widget'
});

Package.on_use(function (api, where) {
  api.use('ecmascript', 'client');
  api.add_files(['lib/chotot-upload/index.js'], ['client']);
  api.mainModule('index.js', 'client');
});
