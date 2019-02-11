Package.describe({
  summary: 'Study UI Widget',
  version: '0.0.1',
  name: 'study:ui-widget'
});

Package.on_use(function (api, where) {
  api.use('ecmascript', 'client');
  api.use(['templating','blaze', 'spacebars', 'less'],['client'])
  api.add_files(['list-pagination/index.html', 'list-pagination/index.js', 'list-pagination/index.less'], ['client']);
  api.add_files(['list-pagination/sort-menu/sort-menu.html', 'list-pagination/sort-menu/sort-menu.js'], ['client']);
});
