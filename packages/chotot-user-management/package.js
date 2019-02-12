Package.describe({
  summary: 'Chotot User Management',
  version: '0.0.1',
  name: 'chotot:user-management'
});

Package.on_use(function (api, where) {
  api.use('ecmascript');
  api.use(['aldeed:simple-schema', 'aldeed:collection2@2.10.0','chotot:logger', 'chotot:role', 'chotot:platform'], ['server']);
  api.add_files(['account.js'], 'server');
});
