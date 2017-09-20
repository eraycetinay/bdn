var bdn = angular.module('bdn', ['ngSanitize', 'ui.router', 'ngMask', 'mgcrea.ngStrap','btford.socket-io','esri.map']);

angular.module('bdn').config(function($locationProvider, $provide, $stateProvider) { 

      $locationProvider.html5Mode(true);
      $locationProvider.hashPrefix('!');
});
