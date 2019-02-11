Package.describe({
  summary: "Login service for google accounts",
  version: "1.2.0",
  name: "chotot:accounts-google"
});

Package.onUse(function(api) {
  api.use(['ecmascript','accounts-google']);
  api.use([
    'chotot:logger',
  ], ['server']);
  api.imply([
    'useraccounts:core@1.14.2',
  ], ['client']);
  api.use('service-configuration', 'server');
  api.use('accounts-base', ['client', 'server']);
  // Export Accounts (etc) to packages using this one.
  api.imply('accounts-base', ['client', 'server']);
  api.addFiles('init.js', 'server')
});
