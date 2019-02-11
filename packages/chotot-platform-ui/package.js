Package.describe({
  summary: 'Chotot Platform UI',
  version: '0.0.1',
  name: 'chotot:platform-ui'
});
Package.on_use(function (api, where) {
  api.use(['ecmascript', 'chotot:common', 'ctp:tools', 'session'], 'client');
  api.use(['templating','blaze', 'less', 'study:form-widget','iron:router', 'reactive-var', 'tsega:bootstrap3-datetimepicker', 'chotot:datatable', 'tracker'],['client'])
  api.export('__', 'client')
  api.export('BaseTemplate', 'client')
  api.export('BaseMethod', 'client')
  api.export('dsLog', 'client')
  api.export('BaseSchema', 'client')
  api.export('InputSchema', 'client')
  api.export('ViewSchema', 'client');
  api.add_files([
    'base/utils/data/index.js',
  ], 'client');
  api.add_files([ 
    '0/ds-log/toastr.css',
    '0/ds-log/dsLog.js',
    '0/ds-log/toastr.js',
    '0/common.css',
    '0/__.js',
    '0/autocomplete.js',
    '0/globalHelper.js',
    'base/action/method.js',
    'base/baseTemplate.js',
    'base/ui/template.css',
    'base/ui/details/action/index.html',
    'base/ui/details/action/index.js',
    'base/ui/details/index.html',
    'base/ui/details/index.js',
    'base/ui/details/index.less',
    'base/ui/s-actions/index.html',
    'base/ui/s-actions/index.js',
    'base/ui/template.html',
    'base/ui/template.js',
    'base/ui/wiget/table/button/button-action.html',
    'base/ui/wiget/table/button/button-action.js',
    'base/ui/wiget/table/data.js',
    'base/ui/wiget/table/search/search-input.html',
    'base/ui/wiget/table/search/search-input.js',
    'base/ui/wiget/table/table.html',
    'base/ui/wiget/table/table.js',
    'base/ui/wiget/visibility-col/vscol.html',
    'base/ui/wiget/visibility-col/vscol.js',
    'base/ui/wrap/ct-wrap.html',
    'base/ui/wrap/ct-wrap.js',
    'heads/heads.html',
    'heads/heads.js',
    'schema/for/for.html',
    'schema/for/forin.html',
    'schema/for/for.js',
    'schema/input/input-span-action/span.html',
    'schema/input/input-span-action/span.js',
    'schema/input/input.html',
    'schema/input/input.js',
    'schema/input/input-no-schema.html',
    'schema/input/input-no-schema.js',
    'schema/lib/error.js',
    'schema/lib/input.js',
    'schema/lib/view.js',
    'schema/lib/schema.js',
    'schema/lib/type.js',
    'schema/schema.html',
    'schema/schema.js',
    'schema/view/index.html',
    'schema/view/index.js',
    'navigation/index.js'
   ], 'client');
  api.add_files(['index.js'], 'client');
});

