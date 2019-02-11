Package.describe({
    summary: 'Chotot Platform View',
    version: '0.0.1',
    name: 'chotot:platform-view'
  });
Package.on_use(function (api, where) {
    api.use(['ecmascript', 'chotot:common', 'useraccounts:core'], 'client');
    api.use(['templating','blaze', 'less', 'iron:router', 'reactive-var'],['client'])
    api.add_files([
        'config/account.js',
        'config/router.js',
    ], 'client');
    api.add_files([
        'lib/stylesheets/animatecss/animate.css',
        
        'lib/stylesheets/globals/badgets_labels.import.less',
        'lib/stylesheets/globals/base.import.less',
        'lib/stylesheets/globals/buttons.import.less',
        'lib/stylesheets/globals/chat.import.less',
        'lib/stylesheets/globals/custom.import.less',
        'lib/stylesheets/globals/date-picker.import.less',
        'lib/stylesheets/globals/elements.import.less',
        'lib/stylesheets/globals/icheck.import.less',
        'lib/stylesheets/globals/landing.import.less',
        'lib/stylesheets/globals/md-skin.import.less',
        'lib/stylesheets/globals/media.import.less',
        'lib/stylesheets/globals/metismenu.import.less',
        'lib/stylesheets/globals/mixins.import.less',
        'lib/stylesheets/globals/navigation.import.less',
        'lib/stylesheets/globals/pages.import.less',
        'lib/stylesheets/globals/rtl.import.less',
        'lib/stylesheets/globals/sidebar.import.less',
        'lib/stylesheets/globals/skins.import.less',
        'lib/stylesheets/globals/spinners.import.less',
        'lib/stylesheets/globals/sweetalert.import.less',
        'lib/stylesheets/globals/theme-config.import.less',
        'lib/stylesheets/globals/top_navigation.import.less',
        'lib/stylesheets/globals/typography.import.less',
        'lib/stylesheets/globals/variables.import.less',
        
        'lib/stylesheets/style.less',
        
        'lib/custom.css',
        'lib/select2.css',
        'lib/spectrum.css',
        'lib/icheck.min.js',
        'lib/jsoneditor.min.css',
        'lib/sweetalert.min.js',
        'lib/datepicker.js',
        'lib/select2.js',
        'lib/spectrum.js',
        'lib/zoom.js',
    ], 'client');
    api.add_files([
        'actions/add/add.html',
        'actions/add/add.js',
        
        'actions/details/details.html',
        'actions/details/details.js',
        'actions/edit/edit.html',
        'actions/edit/edit.js',
        
        'actions/export-csv/index.html',
        'actions/export-csv/popup.html',
        'actions/export-csv/popup.js',
        
        'actions/import/import.html',
        'actions/import/import.js',
        
        'actions/remove/index.html',
        'actions/remove/popup.html',
        'actions/remove/popup.js',
        'custom/ad-hoc.less',
        'input/array_checkbox/input.html',
        'input/array_checkbox/input.js',
        
        'input/autocomplete/input.html',
        'input/autocomplete/input.js',
        
        'input/checkbox/input.html',
        
        'input/csv/input.html',
        
        'input/date/input.less',
        'input/date/input.html',
        'input/date/input.js',
        
        'input/datetime/input.html',
        'input/datetime/input.js',
        
        'input/default/input.html',
        'input/default/input.js',
        
        'input/float/float.html',
        'input/json_array/input.html',
        'input/json_array/input.js',
        
        'input/json_geo/input.html',
        'input/json_geo/input.js',
        
        'input/json_images/images.css',
        'input/json_images/images.html',
        'input/json_images/images.js',
        
        'input/json_select/input.html',
        'input/json_select/input.js',
        
        'input/list_value/list_checkbox/list_checkbox.html',
        'input/list_value/list_checkbox/list_checkbox.js',
        
        'input/list_value/radio/radio.html',
        'input/list_value/radio/radio.js',
        
        'input/list_value/common.js',
        
        'input/logo/logo.html',
        'input/logo/logo.js',
        
        'input/multiselect/bootstrap-multiselect.less',
        'input/multiselect/input.less',
        'input/multiselect/input.html',
        'input/multiselect/bootstrap-multiselect.js',
        'input/multiselect/input.js',
        
        'input/ref/input.html',
        'input/ref/input.js',
        
        'input/select/input.html',
        'input/select/input.js',
        
        'input/stable/input.html',
        'input/stable/input.js',
        
        'input/tab/input.html',
        'input/tab/input.js',
        
        'input/textarea/input.html',
        'input/textarea/input.js',
        
        'input/view/input.html',
        'input/view/input.js',
        'input/global.js',
    
        'views/common/plugin/metis-menu/metis-menu.css',
        'views/common/plugin/metis-menu/metis-menu.js',
    
        'views/common/loader.css',
        'views/common/style.css',
        'views/common/footer.html',
        'views/common/ibox-tools.html',
        'views/common/loader.html',
        'views/common/navigation.html',
        'views/common/page-heading.html',
        'views/common/right-sidebar.html',
        'views/common/top-navbar.html',
        'views/common/top-navigation.html',
        'views/common/footer.js',
        'views/common/ibox-tools.js',
        'views/common/loader.js',
        'views/common/navigation.js',
        'views/common/page-heading.js',
        'views/common/right-sidebar.js',
        'views/common/top-navbar.js',
        
        'views/home/index.html',
        
        'views/layouts/blank.html',
        'views/layouts/layout2.html',
        'views/layouts/main.html',
        'views/layouts/not-found.html',
        'views/layouts/blank.js',
        'views/layouts/layout2.js',
        'views/layouts/main.js',
        'views/head.html',
    ], 'client');
  });