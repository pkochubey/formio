(function() {
  'use strict';
  angular
    .module('formioApp')
    .config([
      'AppConfig',
      'FormioProvider',
      'FormioAuthProvider',
      '$locationProvider',
      'formioComponentsProvider',
      '$provide',
      function(
        AppConfig,
        FormioProvider,
        FormioAuthProvider,
        $locationProvider,
        formioComponentsProvider,
        $provide
      ) {
        $provide.decorator('valueBuilderWithShortcutsDirective', function ($delegate) {
          if ($delegate.length > 1) {
            return [$delegate[1]]
          }

          return [$delegate[0]]
        });
        $provide.decorator('valueBuilderDirective', function ($delegate) {
          if ($delegate.length > 1) {
            return [$delegate[1]]
          }

          return [$delegate[0]]
        });

        $locationProvider.hashPrefix('');
        FormioProvider.setAppUrl(AppConfig.appUrl);
        FormioProvider.setApiUrl(AppConfig.apiUrl);
        FormioAuthProvider.setForceAuth(true);
        FormioAuthProvider.setStates('auth.login', 'home');
        FormioAuthProvider.register('login', 'user', 'login');

        formioComponentsProvider.register('custom', {disable: true});
      }
    ]);
})();
