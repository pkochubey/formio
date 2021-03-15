/* global moment:false */
(function() {
  'use strict';
  angular
    .module('formioApp')
    .constant('moment', moment)
    .constant('FormController', [
      '$scope',
      '$stateParams',
      '$state',
      'Formio',
      'FormioHelperConfig',
      'FormioAlerts',
      function (
        $scope,
        $stateParams,
        $state,
        Formio,
        FormioHelperConfig,
        FormioAlerts
      ) {
        $scope.loading = true;
        $scope.hideComponents = [];
        $scope.submission = {data: {}};
        $scope.formId = $stateParams.formId;
        $scope.formUrl = FormioHelperConfig.appUrl + '/form';
        $scope.appUrl = FormioHelperConfig.appUrl;
        var formTag = FormioHelperConfig.tag || 'common';
        $scope.formUrl += $stateParams.formId ? ('/' + $stateParams.formId) : '';
        $scope.form = {
          display: 'form',
          components:[],
          type: ($stateParams.formType ? $stateParams.formType : 'form'),
          tags: [formTag]
        };
        $scope.tags = [{text: formTag}];
        $scope.formio = new Formio($scope.formUrl);
        $scope.formDisplays = [
          {
            name: 'form',
            title: 'Form'
          },
          {
            name: 'wizard',
            title: 'Wizard'
          }
        ];

        // Load the form if the id is provided.
        if ($stateParams.formId) {
          $scope.formLoadPromise = $scope.formio.loadForm().then(function(form) {
            form.display = form.display || 'form';
            $scope.form = form;
            var tags = form.tags || [];
            $scope.tags = tags.map(function(tag) { return {text: tag}; });
            return form;
          }, FormioAlerts.onError.bind(FormioAlerts));
        }
        else {
          // Load the roles available.
          if (!$scope.form.submissionAccess) {
            Formio.makeStaticRequest(Formio.getProjectUrl() + '/role?limit=1000').then(function(roles) {
              if ($scope.form.submissionAccess) {
                return;
              }
              angular.forEach(roles, function(role) {
                if (!role.admin && !role.default) {
                  // Add access to the form being created to allow for authenticated people to create their own.
                  $scope.form.submissionAccess = [
                    {
                      type: 'create_own',
                      roles: [role._id]
                    },
                    {
                      type: 'read_own',
                      roles: [role._id]
                    },
                    {
                      type: 'update_own',
                      roles: [role._id]
                    },
                    {
                      type: 'delete_own',
                      roles: [role._id]
                    }
                  ];
                }
              });
            });
          }
        }

        $scope.titleChange = function(oldTitle) {
          $scope.form.name = _.camelCase(window.transliterate($scope.form.title));
          $scope.form.path = $scope.form.name
          if ($scope.$parent && $scope.$parent.form) {
            $scope.$parent.form.title = $scope.form.title;
          }
        };

        // Update form tags
        $scope.updateFormTags = function() {
          $scope.form.tags = $scope.tags.map(function(tag) { return tag.text; });
        };

        // When display is updated
        $scope.$watch('form.display', function (display) {
          $scope.$broadcast('formDisplay', display);
        });

        // When a submission is made.
        $scope.$on('formSubmission', function(event, submission) {
          FormioAlerts.addAlert({
            type: 'success',
            message: 'New submission added!'
          });
          if (submission._id) {
            $state.go($scope.basePath + 'form.submission.view', {subId: submission._id});
          }
        });

        $scope.$on('pagination:error', function() {
          $scope.loading = false;
        });
        $scope.$on('pagination:loadPage', function() {
          $scope.loading = false;
        });

        // Called when the form is updated.
        $scope.$on('formUpdate', function(event, form) {
          $scope.form.components = form.components;
        });

        $scope.$on('formError', function(event, error) {
          FormioAlerts.onError(error);
        });

        // Called when the form or resource is deleted.
        $scope.$on('delete', function() {
          var type = $scope.form.type === 'form' ? 'Form ' : 'Resource ';
          FormioAlerts.addAlert({
            type: 'success',
            message: type + $scope.form.name + ' was deleted.'
          });
          $state.go($scope.basePath + 'home');
        });

        $scope.$on('cancel', function() {
          $state.go($scope.basePath + 'form.view');
        });

        // Save a form.
        $scope.saveForm = function() {
          $scope.formio.saveForm(angular.copy($scope.form)).then(function(form) {
            angular.merge($scope.form, form);
            var method = $stateParams.formId ? 'updated' : 'created';
            FormioAlerts.addAlert({
              type: 'success',
              message: 'Successfully ' + method + ' form!'
            });
            $state.go($scope.basePath + 'form.view', {formId: form._id});
          }, FormioAlerts.onError.bind(FormioAlerts));
        };
      }
    ])
    .constant('FormIndexController', [
      '$scope',
      '$state',
      'FormioHelperConfig',
      function (
        $scope,
        $state,
        FormioHelperConfig
      ) {
        $scope.form = {
          search: '',
          type: 'title'
        };
        $scope.formsUrlParams = {};
        $scope.searchTypes = [
          {
            name: 'title',
            title: 'Title'
          },
          {
            name: 'name',
            title: 'Name'
          },
          {
            name: 'tags',
            title: 'Tags'
          }
        ];

        $scope.forms = [];
        $scope.formsUrl = FormioHelperConfig.appUrl + '/form?type=form&tags=' + FormioHelperConfig.tag;
        $scope.formsPerPage = FormioHelperConfig.perPage;

        $scope.formUrl = FormioHelperConfig.appUrl + '/form/';
        $scope.formio = new Formio($scope.formUrl);

        $scope.updateFormSearch = function() {
          var params = {};
          if ($scope.form.search.length > 0) {
            var paramName = $scope.form.type+'__regex';
            params[paramName] = '/'+$scope.form.search+'/i';
          }
          $scope.formsUrlParams = params;
        };

        $scope.cloneForm = function (data) {
          var xhr = new XMLHttpRequest();
          xhr.open('POST', $scope.formUrl + data.formId + '/clone', false);
          xhr.setRequestHeader("x-jwt-token", $scope.formio.getToken());
          xhr.send({ formId: data.formId });

          if (xhr.status != 200) {
            console.log(xhr.status + ': ' + xhr.statusText);
            window.location.reload()
          } else {
            var xhrGet = new XMLHttpRequest();
            xhrGet.open('GET', window.location.origin + '/' + xhr.responseText, false);
            xhrGet.setRequestHeader("x-jwt-token", $scope.formio.getToken());
            xhrGet.send();

            var form = JSON.parse(xhrGet.responseText);
            console.log(xhrGet.responseText, form)
            window.location.href = window.location.href + 'form/' + form._id + '/'
          }
        }
      }
    ]);

})();
