Package.describe({
 summary: 'Chotot Postgres Simple Query',
  version: '0.0.1',
  name: 'chotot:postgres-simple-query'
});

Npm.depends({
  "pg": "6.1.0",
});

Package.onUse(function (api, where) {
  api.use('ecmascript@0.5.9');
  api.use('chotot:logger', 'server');
  api.addFiles(['lib/ParseQuery.js'], 'server');
  api.mainModule('index.js', 'server');
});
