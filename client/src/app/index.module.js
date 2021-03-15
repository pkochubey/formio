(function() {
  'use strict';
  angular
    .module('formioApp', [
      'ngSanitize',
      'ui.router',
      'ui.bootstrap',
      'ui.bootstrap.accordion',
      'ui.bootstrap.alert',
      'ngFormBuilder',
      'ngFormioHelper',
      'ngFormBuilderHelper',
      'bgf.paginateAnything',
      'formio',
      'ngMap'
    ])
    .directive('valueBuilderWithShortcuts', function (BuilderUtils) {
      return {
        scope: {
          form: '=',
          component: '=',
          data: '=',
          label: '@',
          tooltipText: '@',
          valueLabel: '@',
          labelLabel: '@',
          valueProperty: '@',
          labelProperty: '@'
        },
        restrict: 'E',
        template: '<div class="form-group">' +
          '<label form-builder-tooltip="{{ tooltipText | formioTranslate }}">{{ label | formioTranslate }}</label>' +
          '<table class="table table-condensed">' +
          '<thead>' +
          '<tr>' +
          '<th class="col-xs-5">{{ labelLabel | formioTranslate }}</th>' +
          '<th class="col-xs-3">{{ valueLabel | formioTranslate }}</th>' +
          '<th class="col-xs-2">{{ \'Shortcut\' | formioTranslate }}</th>' +
          '<th class="col-xs-1"></th>' +
          '</tr>' +
          '</thead>' +
          '<tbody>' +
          '<tr ng-repeat="v in data track by $index">' +
          '<td class="col-xs-5"><input type="text" class="form-control" ng-model="v[labelProperty]" placeholder="{{ labelLabel | formioTranslate }}"/></td>' +
          '<td class="col-xs-3"><input type="text" class="form-control" ng-model="v[valueProperty]" placeholder="{{ valueLabel | formioTranslate }}"/></td>' +
          '<td class="col-xs-2"><select class="form-control" id="shortcut" name="shortcut" ng-options="shortcut as shortcut | formioTranslate for shortcut in shortcuts[$index]" ng-model="v.shortcut"  placeholder="Shortcut"></select></td>' +
          '<td class="col-xs-1"><button type="button" class="btn btn-danger btn-xs" ng-click="removeValue($index)" tabindex="-1"><span class="glyphicon glyphicon-remove-circle"></span></button></td>' +
          '</tr>' +
          '</tbody>' +
          '</table>' +
          '<button type="button" class="btn btn-primary" ng-click="addValue()"><span class="glyphicon glyphicon-plus"></span> {{ \'Add Value\' | formioTranslate }}</button>' +
          '</div>',
        replace: true,
        link: function($scope, el, attrs) {
          $scope.valueProperty = $scope.valueProperty || 'value';
          $scope.labelProperty = $scope.labelProperty || 'label';
          $scope.valueLabel = $scope.valueLabel || 'Value';
          $scope.labelLabel = $scope.labelLabel || 'Label';

          var shortcuts = BuilderUtils.getAvailableShortcuts($scope.form, $scope.component);
          $scope.shortcuts = [];

          $scope.data = $scope.data || [];

          if ($scope.data.length) {
            updateShortcuts($scope.data);
          }

          $scope.addValue = function() {
            var obj = {};
            obj[$scope.valueProperty] = '';
            obj[$scope.labelProperty] = '';
            obj.shortcut = '';
            $scope.data.push(obj);
          };

          $scope.removeValue = function(index) {
            $scope.data.splice(index, 1);
          };

          if ($scope.data.length === 0) {
            $scope.addValue();
          }

          if (!attrs.noAutocompleteValue) {
            $scope.$watch('data', function(newValue, oldValue) {
              if (newValue.length !== oldValue.length) {
                updateShortcuts(newValue);
                return;
              }

              var shortcutChanged = false;
              _.map(newValue, function(entry, i) {
                var oldEntry = oldValue[i];

                if (entry.shortcut !== oldEntry.shortcut) {
                  shortcutChanged = true;
                }

                entry[$scope.valueProperty] = _.camelCase(window.transliterate(entry[$scope.labelProperty]));
              });

              if (shortcutChanged) {
                updateShortcuts(newValue);
              }
            }, true);
          }

          function updateShortcuts(entries) {
            var bindedShortcuts = [];
            entries.forEach(function(entry) {
              if (entry.shortcut) {
                bindedShortcuts.push(entry.shortcut);
              }
            });
            $scope.shortcuts = entries.map(function(entry) {
              var shortcutsToOmit = _.without(bindedShortcuts, entry.shortcut);
              return _.difference(shortcuts, shortcutsToOmit);
            });
          }
        }
      };
    })
    .directive('valueBuilder' ,function() {
      return {
        scope: {
          data: '=',
          label: '@',
          tooltipText: '@',
          valueLabel: '@',
          labelLabel: '@',
          valueProperty: '@',
          labelProperty: '@'
        },
        restrict: 'E',
        template: '<div class="form-group">' +
          '<label form-builder-tooltip="{{ tooltipText | formioTranslate }}">{{ label | formioTranslate }}</label>' +
          '<table class="table table-condensed">' +
          '<thead>' +
          '<tr>' +
          '<th class="col-xs-6">{{ labelLabel | formioTranslate }}</th>' +
          '<th class="col-xs-4">{{ valueLabel | formioTranslate }}</th>' +
          '<th class="col-xs-2"></th>' +
          '</tr>' +
          '</thead>' +
          '<tbody>' +
          '<tr ng-repeat="v in data track by $index">' +
          '<td class="col-xs-6"><input type="text" class="form-control" ng-model="v[labelProperty]" placeholder="{{ labelLabel | formioTranslate }}"/></td>' +
          '<td class="col-xs-4"><input type="text" class="form-control" ng-model="v[valueProperty]" placeholder="{{ valueLabel | formioTranslate }}"/></td>' +
          '<td class="col-xs-2"><button type="button" class="btn btn-danger btn-xs" ng-click="removeValue($index)" tabindex="-1"><span class="glyphicon glyphicon-remove-circle"></span></button></td>' +
          '</tr>' +
          '</tbody>' +
          '</table>' +
          '<button type="button" class="btn btn-primary" ng-click="addValue()"><span class="glyphicon glyphicon-plus"></span> {{ \'Add Value\' | formioTranslate }}</button>' +
          '</div>',
        replace: true,
        link: function($scope, el, attrs) {
          $scope.valueProperty = $scope.valueProperty || 'value';
          $scope.labelProperty = $scope.labelProperty || 'label';
          $scope.valueLabel = $scope.valueLabel || 'Value';
          $scope.labelLabel = $scope.labelLabel || 'Label';
          $scope.data = $scope.data || [];

          $scope.addValue = function() {
            var obj = {};
            obj[$scope.valueProperty] = '';
            obj[$scope.labelProperty] = '';
            $scope.data.push(obj);
          };

          $scope.removeValue = function(index) {
            $scope.data.splice(index, 1);
          };

          if ($scope.data.length === 0) {
            $scope.addValue();
          }

          if (!attrs.noAutocompleteValue) {
            $scope.$watch('data', function(newValue, oldValue) {
              // Ignore array addition/deletion changes
              if (newValue.length !== oldValue.length) {
                return;
              }

              _.map(newValue, function(entry, i) {
                entry[$scope.valueProperty] = _.camelCase(window.transliterate(entry[$scope.labelProperty]));
              });
            }, true);
          }
        }
      };
    })
    .factory('BuilderUtils', function(FormioUtils) {
      var suffixRegex = /(\d+)$/;

      /**
       * Memoize the given form components in a map, using the component keys.
       *
       * @param {Array} components
       *   An array of the form components.
       * @param {Object} input
       *   The input component we're trying to uniquify.
       *
       * @returns {Object}
       *   The memoized form components.
       */
      var findExistingComponents = function(components, input) {
        // Prebuild a list of existing components.
        var existingComponents = {};
        FormioUtils.eachComponent(components, function(component) {
          // If theres no key, we cant compare components.
          if (!component.key) return;

          // A component is pre-existing if the key is unique, or the key is a duplicate and its not flagged as the new component.
          if (
            (component.key !== input.key) ||
            ((component.key === input.key) && (!!component.isNew !== !!input.isNew))
          ) {
            existingComponents[component.key] = component;
          }
        }, true);

        return existingComponents;
      };

      /**
       * Determine if the given component key already exists in the memoization.
       *
       * @param {Object} memoization
       *   The form components map.
       * @param component
       *   The component to uniquify.
       *
       * @returns {boolean}
       *   Whether or not the key exists.
       */
      var keyExists = function(memoization, key) {
        if (memoization.hasOwnProperty(key)) {
          return true;
        }
        return false;
      };

      /**
       * Iterate the given key to make it unique.
       *
       * @param {String} key
       *   Modify the component key to be unique.
       *
       * @returns {String}
       *   The new component key.
       */
      var iterateKey = function(key) {
        if (!key.match(suffixRegex)) {
          return key + '2';
        }

        return key.replace(suffixRegex, function(suffix) {
          return Number(suffix) + 1;
        });
      };

      /**
       * Appends a number to a component.key to keep it unique
       *
       * @param {Object} form
       *   The components parent form.
       * @param {Object} component
       *   The component to uniquify
       */
      var uniquify = function(form, component) {
        var isNew = component.isNew || false;

        // Recurse into all child components.
        FormioUtils.eachComponent([component], function(component) {
          // Force the component isNew to be the same as the parent.
          component.isNew = isNew;

          if(component.label){
            component.key = _.camelCase(window.transliterate(component.label))
          }

          var memoization = findExistingComponents(form.components, component);
          while (keyExists(memoization, component.key)) {
            component.key = iterateKey(component.key);
          }
        }, true);

        return component;
      };

      function getAlphaShortcuts() {
        return _.range('A'.charCodeAt(), 'Z'.charCodeAt() + 1).map(function(charCode) {
          return String.fromCharCode(charCode);
        });
      }

      var additionalShortcuts = {
        button: [
          'Enter',
          'Esc'
        ]
      }

      function getAdditionalShortcuts(type) {
        return additionalShortcuts[type] || [];
      }

      function getBindedShortcuts(components, input) {
        var result = [];

        FormioUtils.eachComponent(components, function(component) {
          if (component === input) {
            return;
          }

          if (component.shortcut) {
            result.push(component.shortcut);
          }
          if (component.values) {
            component.values.forEach(function(value) {
              if (value.shortcut) {
                result.push(value.shortcut);
              }
            });
          }
        }, true);

        return result;
      }

      function getAvailableShortcuts(form, component) {
        return _.difference(
          getAlphaShortcuts().concat(getAdditionalShortcuts(component.type)),
          getBindedShortcuts(form.components, component));
      }

      return {
        getAvailableShortcuts: getAvailableShortcuts,
        uniquify: uniquify
      };
    });
})();
