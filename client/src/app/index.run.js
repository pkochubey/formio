(function() {
  'use strict';
  angular
    .module('formioApp')
    .run([
      '$rootScope',
      'AppConfig',
      'FormioAuth',
      function(
        $rootScope,
        AppConfig,
        FormioAuth
      ) {
        // Initialize the Form.io authentication system.
        FormioAuth.init();

        // Add the forms to the root scope.
        angular.forEach(AppConfig.forms, function(url, form) {
          $rootScope[form] = url;
        });
      }
    ]).run(['formioComponents', '$templateCache', function(formioComponents, $templateCache) {

    $templateCache.put('formio-helper/formbuilder/edit.html', '<form role="form" novalidate>\n' +
      '  <div id="form-group-title" class="form-group">\n' +
      '    <label for="title" class="control-label">Title</label>\n' +
      '    <input type="text" ng-model="form.title" ng-change="titleChange(\'{{form.title}}\')" class="form-control" id="title" placeholder="Enter the form title"/>\n' +
      '  </div>\n' +
      '  <div id="form-group-name" class="form-group">\n' +
      '    <label for="name" class="control-label">Name</label>\n' +
      '    <input type="text" ng-model="form.name" class="form-control" id="name" placeholder="Enter the form machine name"/>\n' +
      '  </div>\n' +
      '  <div id="form-group-path" class="form-group">\n' +
      '    <label for="path" class="control-label">Path</label>\n' +
      '    <input type="text" class="form-control" id="path" ng-model="form.path" placeholder="example" style="text-transform: lowercase">\n' +
      '    <small>The path alias for this form.</small>\n' +
      '  </div>\n' +
      '  <input type="hidden" ng-model="form.type"/>\n' +
      '  <div ng-include="\'formio-helper/formbuilder/settings.html\'"></div>\n' +
      '  <form-builder form="form" src="formUrl" options="{noSubmit:true}"></form-builder>\n' +
      '  <div class="form-group pull-right">\n' +
      '    <a class="btn btn-default" ng-click="cancel()">Cancel</a>\n' +
      '    <input type="submit" class="btn btn-primary" ng-click="saveForm()" value="{{formId ? \'Save\' : \'Create\'}} {{ capitalize(form.type)  }}" />\n' +
      '  </div>\n' +
      '</form>\n');

    $templateCache.put('formio-helper/formbuilder/index.html',
      '<a ng-if="isAdministrator || formAccess([\'create_all\'])" ui-sref="{{ basePath }}createForm({formType: \'form\'})" class="btn btn-primary"><span class="glyphicon glyphicon-plus"></span> Create Form</a>\n' +
      '<div class="form-inline" style="margin-top: 20px;width: 100%;">\n' +
      '<div class="form-group" style="width: 100%;">\n' +
      '<div class="input-group">\n' +
      '<span class="input-group-addon" style="width:20px;"><span class="glyphicon glyphicon-search"></span></span>\n' +
      '<input id="form-search-form" class="form-control" ng-model="form.search" ng-model-options="{ debounce: 200 }" ng-change="updateFormSearch()" placeholder="Find a form..." type="text">\n' +
      '<span class="input-group-addon" style="padding-top: 0;padding-bottom: 0;width:100px;">\n' +
      '<select name="formsSearchType" id="formsSearchType" ng-model="form.type" ng-change="updateFormSearch()" class="form-control" ng-options="type.name as type.title for type in searchTypes" style="height:2em;float:left;width:100%;padding:0;"></select>\n' +
      '</span>\n' +
      '</div>\n' +
      '</div>\n' +
      '</div>\n' +
      '<span class="glyphicon glyphicon-refresh glyphicon-spin" style="font-size: 2em;" ng-if="loading"></span>\n' +
      '<table class="table table-striped" style="margin-top: 20px;">\n' +
      '    <tbody>\n' +
      '    <tr data-ng-repeat="form in forms" ng-if="isAdministrator || hasAccess(form.name, [\'create_own\', \'create_all\', \'read_all\', \'create_own\'])">\n' +
      '        <td>\n' +
      '            <div class="row">\n' +
      '                <div class="col-sm-8">\n' +
      '                    <a ui-sref="{{ basePath }}form.view({formId: form._id})"><h5>{{ form.title }}</h5></a>\n' +
      '                </div>\n' +
      '                <div class="col-sm-4">\n' +
      '                    <div class="button-group pull-right" style="display:flex;">\n' +
      '                        <a ng-if="isAdministrator || hasAccess(form.name, [\'create_own\', \'create_all\'])" ui-sref="{{ basePath }}form.view({formId: form._id})" class="btn btn-default btn-xs">\n' +
      '                            <span class="glyphicon glyphicon-pencil"></span> Enter Data\n' +
      '                        </a>&nbsp;\n' +
      '                        <a ng-if="isAdministrator || hasAccess(form.name, [\'read_all\', \'create_own\'])" ng-click="cloneForm({formId: form._id})" class="btn btn-default btn-xs">\n' +
      '                            <span class="glyphicon glyphicon-new-window"></span> Clone\n' +
      '                        </a>&nbsp;\n' +
      '                        <a ng-if="isAdministrator || formAccess([\'edit_all\', \'create_all\'])" ui-sref="{{ basePath }}form.edit({formId: form._id})" class="btn btn-default btn-xs">\n' +
      '                            <span class="glyphicon glyphicon-edit"></span> Edit Form\n' +
      '                        </a>&nbsp;\n' +
      '                        <a ng-if="isAdministrator || formAccess([\'delete_all\'])" ui-sref="{{ basePath }}form.delete({formId: form._id, formType: \'form\'})" class="btn btn-default btn-xs">\n' +
      '                            <span class="glyphicon glyphicon-trash"></span>\n' +
      '                        </a>\n' +
      '                    </div>\n' +
      '                </div>\n' +
      '            </div>\n' +
      '        </td>\n' +
      '    </tr>\n' +
      '    </tbody>\n' +
      '</table>\n' +
      '<bgf-pagination\n' +
      '        collection="forms"\n' +
      '        url="formsUrl"\n' +
      '        url-params="formsUrlParams"\n'+
      '        per-page="formsPerPage"\n' +
      '        template-url="formio-helper/pager.html"\n' +
      '></bgf-pagination>\n');
  }]);
})();
