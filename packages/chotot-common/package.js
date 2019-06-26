Package.describe({
  summary: 'Chotot Common',
  version: '0.0.1',
  name: 'chotot:common'
});
Npm.depends({
  "lodash": "4.13.1",
  "ct-iris-client": "1.0.9"
});
Package.on_use(function (api, where) {
  api.use('ecmascript');
  api.add_files([
    'ads/iris.js',
    'ads/map_ad_params.js',
    'ads/map_ad_params_centrailize_cconf.js',
    'ads/s_cp.js',
    'sort.js'
  ]);
  api.add_files(['func/input-script.js'], 'client');
  api.add_files(['index.js']);
  api.export('_', ['server', 'client']);
});
