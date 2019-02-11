Package.describe({
    summary: 'Chotot ctpTools prebuilding',
    version: '0.0.1',
    name: 'ctp:tools'
  });
  
  Package.on_use(function (api, where) {
    api.use([
      'ecmascript',
      'templating',
      'spacebars-compiler',
    ], 'client');
    api.add_files([
      'spacebar/input/input.html',
      'spacebar/input/input.js',
      
      'spacebar/index.js',
      
    ], 'client');
    
    
    
  });
  