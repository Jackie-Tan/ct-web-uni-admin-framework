Package.describe({
    summary: 'Chotot Role Def',
    version: '0.0.1',
    name: 'chotot:role'
  });
  
  Package.on_use(function (api, where) {
    api.use(['ecmascript', 'chotot:logger', 'chotot:common'], 'server');
    api.add_files(['role-helpers.js', 'role-def.js', 'role.js'], 'server');
  });
  