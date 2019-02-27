Package.describe({
  summary: 'Chotot Custom',
  version: '0.0.1',
  name: 'chotot:custom'
});
Npm.depends({
  crypto: '0.0.3',
  'async-run': '1.0.2',
  "request": "2.83.0"
});
Package.on_use(function (api, where) {
  api.use('ecmascript');
  api.use(['templating','blaze', 'spacebars', 'less', 'study:form-widget', 'chotot:platform-ui', 'study:ui-widget'],['client'])
  api.use(['chotot:platform'])
  api.use(['chotot:postgres-simple-query', 'iron:router', 'chotot:logger'], 'server')
  api.add_files(['route/health.js', 'route/metrics.js', 'route/upload.js', 'route/project.js', 'route/s3upload.js', 'route/ssa-upload.js', 'route/shop-upload.js'], 'server');
});
