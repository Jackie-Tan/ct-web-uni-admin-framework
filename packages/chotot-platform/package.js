Package.describe({
  summary: 'Chotot Platfrom',
  version: '0.0.1',
  name: 'chotot:platform'
});
Npm.depends({
  'async-run': '1.0.2'
});
Package.on_use(function (api, where) {
  api.use(['ecmascript', 'chotot:common']);
  api.use(['chotot:postgres-simple-query', 'chotot:role', 'aldeed:simple-schema', 'chotot:logger', 'chotot:platform-ctp'],['server']);
  api.add_files([
    'lib/client/index.js',
    
    'lib/internal/index.js',
    
    'lib/method/index.js',
    'lib/method/permission.js',
    'lib/method/secure-methods.js',
    
    'lib/model/autoValue.js',
    'lib/model/index.js',
    'lib/model/options.js',
    'lib/model/schema.js',
  ], 'server');
  api.add_files(['baseTemplate-server.js', 'index.js'], 'server');
  api.add_files(['export/internal.js'], 'client')
  api.export('Internal', 'client');
  api.export('IRequest', 'server');
  api.export('BaseTemplate', 'server');
});
