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
  api.add_files(['ui/g_sms/index.html','ui/g_sms/index.js', 'ui/g_sms/index.less'], 'client');
  api.add_files(['details-page/project/link-view/confirm/index.html','details-page/project/link-view/confirm/index.js'], 'client');
  api.add_files(['details-page/project/link-view/index.html','details-page/project/link-view/index.js'], 'client');
  api.add_files(['details-page/project/over-view/add/index.html','details-page/project/over-view/add/index.js'], 'client');
  api.add_files(['details-page/project/project.html','details-page/project/project.js', 'details-page/project/project.less'], 'client');
  api.add_files(['details-page/campaigns/campaigns.html','details-page/campaigns/campaigns.js', 'details-page/campaigns/campaigns.less'], 'client');
  api.add_files(['ui/fraud/block_keys/add/index.html','ui/fraud/block_keys/add/index.js'], 'client');
  api.add_files(['ui/fraud/block_keys/index.html','ui/fraud/block_keys/index.js'], 'client');
  api.add_files(['ui/fraud/block_images/add/index.html','ui/fraud/block_images/add/index.js'], 'client');
  api.add_files(['ui/fraud/block_images/index.html','ui/fraud/block_images/index.js'], 'client');
  api.add_files(['ui/fraud/index.html'], 'client');
  api.add_files(['ui/ban/index.html','ui/ban/index.js'], 'client');
  api.add_files(['route/health.js', 'route/upload.js', 'route/project.js', 'route/s3upload.js', 'route/ssa-upload.js', 'route/shop-upload.js'], 'server');
});
