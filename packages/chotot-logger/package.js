
Package.describe({
  summary: 'Chotot Logger',
  version: '0.0.1',
  name: 'chotot:logger'
});
Npm.depends({
  'moment-timezone': '0.5.14',
  'prom-client': '4.1.0',
  'log4js': '0.6.38'
})
Package.on_use(function (api, where) {
  api.use('ecmascript');
  api.add_files('logger.js', 'server');
  api.export('logger', 'server')
});
