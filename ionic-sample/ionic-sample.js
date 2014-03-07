
//define model here then define in controller.
//Attaching to rootScope makes it accessible to all scopes
Tasks = new Meteor.Collection('tasks');
Projects = new Meteor.Collection('projects');

if (Meteor.isClient) {
  ngMeteor.run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;

      $rootScope.console = console;
      $rootScope.alert = alert;

      $rootScope.Session = Session;

      window.$rootScope = $rootScope;
  }]);

  ngMeteor.config([
    '$provide', function ($provide) {
        return $provide.decorator('$rootScope', [
            '$delegate', function ($delegate) {
                $delegate.safeApply = function (fn) {
                    var phase = $delegate.$$phase;
                    if (phase === "$apply" || phase === "$digest") {
                        if (fn && typeof fn === 'function') {
                            fn();
                        }
                    } else {
                        $delegate.$apply(fn);
                    }
                };
                return $delegate;
            }
        ]);
      }
  ]);

  ngMeteor.controller('MainCtrl', ['$scope', '$collection', '$rootScope', '$ionicModal',
    function ($scope, $collection, $rootScope, $ionicModal) {

        $collection('Tasks', $rootScope);
        $collection('Projects', $rootScope);

        Deps.autorun(function() {
            $scope.safeApply(function () {
                $scope.title = Session.get('my-title');
            });
        });

        $rootScope.title2 = "another title";

        // No need for testing data anymore
        $scope.tasks = [];

        // Create and load the Modal
        $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
          $scope.taskModal = modal;
        }, {
          scope: $scope,
          animation: 'slide-in-up'
        });

        // Called when the form is submitted
        $scope.createTask = function(task) {
          $rootScope.Tasks.add({
            title: task.title
          });
          $scope.taskModal.hide();
          task.title = "";
        };

        // Open our new task modal
        $scope.newTask = function() {
          $scope.taskModal.show();
        };

        // Close the new task modal
        $scope.closeNewTask = function() {
          $scope.taskModal.hide();
        };
        
          }
]);

  // ngMeteor.config(['$stateProvider', '$urlRouterProvider',
  //     function ($stateProvider, $urlRouterProvider) {
  //         $urlRouterProvider.otherwise("/");

  //         $stateProvider
  //             .state('home', {
  //                 url: "/",
  //                 template: Template.home,
  //                 views:{
  //                     'centerContent': {template: Template.centerContent
  //                     },
  //                     'leftMenu': {template: Template.leftMenu
  //                     },
  //                     // 'newProject': {
  //                     //     template: Template['newProject']
  //                     // },
  //                     // 'newTask': {
  //                     //     template: Template['newTask']
  //                     // }
  //                 }
  //             });        
  //     }
  // ]);
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
