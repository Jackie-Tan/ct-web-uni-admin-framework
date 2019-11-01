Package.describe({
  summary: "Login service for CP accounts",
  version: "1.3.0",
  name: "chotot:accounts-cp"
});

Npm.depends({
  'extend': '3.0.1',
  'sha1': '1.1.1',
  'memcached': '2.2.2'
})
Package.onUse(function(api) {
  api.use(['ecmascript', 'aldeed:simple-schema', 'aldeed:collection2@2.10.0']);
  api.use([
    'useraccounts:core',
  ], ['client']);
  api.use([
    'chotot:logger',
  ], ['server']);
  api.use(['reactive-var'], 'client');
  api.imply([
    'useraccounts:core@1.14.2',
  ], ['client']);
  api.use(['service-configuration', 'chotot:user-management'], 'server');
  api.use('accounts-base', ['client', 'server']);
  // Export Accounts (etc) to packages using this one.
  api.imply('accounts-base', ['client', 'server']);
  api.addFiles("base/trans-msg.js", 'server');
  api.addFiles("server.js", 'server');
  api.addFiles(["client/username.js"], 'client');
});
