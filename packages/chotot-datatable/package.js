Package.describe({
  summary: 'Chotot Datatable',
  version: '0.0.1',
  name: 'chotot:datatable'
});
Npm.depends({
  "datatables": "1.10.12",
  "datatables.net": "1.10.12",
  "datatables.net-dt": "1.10.12",
});
Package.on_use(function (api, where) {
  api.use(['ecmascript'], 'client');
  api.add_files('index.js', 'client')
  api.add_files('fnReloadAjax.js', 'client')
});


