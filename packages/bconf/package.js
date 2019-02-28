Package.describe({
    summary: "Chotot Config",
    version: "1.3.0",
    name: "chotot:bconf"
  });
  
  Package.onUse(function(api) {
    api.use(['ecmascript', 'aldeed:simple-schema','aldeed:collection2@2.10.0']);
    api.use(['reactive-var'], 'client');
    api.use([
      'chotot:logger',
    ], ['server']);
    api.addFiles('bconf-version.js');
    api.addFiles(["server/init.js", "server/bconf.js"], 'server');
    api.addFiles(["client/bconf.js"], 'client');
    api.export('Confs');
    api.export("Bconf", 'client');
    api.export("Bconf", 'server');
  });
  