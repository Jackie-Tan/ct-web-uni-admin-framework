Package.describe({
    summary: 'Chotot Platform Ctp',
    version: '0.0.1',
    name: 'chotot:platform-ctp'
  });
  
  Package.on_use(function (api, where) {
    api.use([
      'ecmascript',
      'chotot:common',
      'ctp:tools',
      'chotot:logger',
    ], 'server');
    api.add_files([
      'c-define/c-base.js',
      'c-define/c-component.js',
      'c-define/c-template.js',
    ], 'server');
    api.add_files([
        'ctp.js',
        'ctp-field.js',
        'ctp-component.js',
    ], 'server');
  });
  
  Package.onTest(function(api) {
    api.use([
      'chotot:platform-ctp',
      'ecmascript',
      'tinytest',
      'test-helpers'
    ]);
    api.add_files('ctp-field_test.js', 'client');
    api.add_files('ctp_test.js', 'client');
  });