
//define model here then define in controller.
//Attaching to rootScope makes it accessible to all scopes
Tasks = new Meteor.Collection('tasks');
Projects = new Meteor.Collection('projects');

Tasks.deny({
  insert: function(userId,doc){
    doc.createdAt = new Date().valueOf();
    doc.updatedAt = doc.createdAt;   
    return false;
  },
  update: function(userId,doc){
    doc.updatedAt = new Date().valueOf();
    return false;
  }
});

Tasks.allow({
  insert: function(userId, doc){
    return true;
  },
  update: function(userId, doc){
    return true;  
  }
});

Projects.deny({
  insert: function(userId,doc){
    doc.createdAt = new Date().valueOf();
    doc.updatedAt = doc.createdAt;   
    return false;
  },
  update: function(userId,doc){
    doc.updatedAt = new Date().valueOf();
    return false;
  }
})

Projects.allow({
  insert: function(userId, doc){
    return true;
  },
  update: function(userId, doc){
    return true;
  }
})

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

  ngMeteor.controller('MainCtrl', ['$scope', '$collection', '$rootScope', '$ionicModal', '$timeout',
    function ($scope, $collection, $rootScope, $ionicModal, $timeout) {

        $collection('Tasks', $rootScope,{},{sort:{updatedAt:-1}});
        $collection('Projects', $rootScope,{},{sort:{updatedAt:-1}});

        $scope.toggleProjects = function() {
          $scope.sideMenuController.toggleLeft();
        };

        Deps.autorun(function() {
            $scope.safeApply(function () {
                $scope.title = Session.get('my-title');
            });
        });

        $rootScope.title2 = "another title";

        // Create and load the Modal
        $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
          $scope.taskModal = modal;
        }, {
          scope: $scope,
          animation: 'slide-in-up'
        });

        // Called when the form is submitted
        $scope.createTask = function(task) {
          var activeProject = Session.get('activeProject')
          if(!Session.get('activeProject') || !task){
            return;
          }
          $rootScope.Tasks.add({
            title: task.title,
            projectId: activeProject._id
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
        
        // Create and load the Modal
        $ionicModal.fromTemplateUrl('new-project.html', function(modal) {
          $scope.projectModal = modal;
        }, {
          scope: $scope,
          animation: 'slide-in-up'
        });

        // Called when the form is submitted
        $scope.createProject = function(project) {
          console.log("creating new project", project)
          if(!project){
            return;
          }
          $rootScope.Projects.add({
            title: project.title,
          });
          Session.set('activeProject', $rootScope.Projects[0] );

          $scope.projectModal.hide();
          project.title = "";
        };

        // Open our new task modal
        $scope.newProject = function() {
          $scope.projectModal.show();
        };

        // Close the new project modal
        $scope.closeNewProject = function() {
          $scope.projectModal.hide();
        };

        // Try to create the first project, make sure to defer
        // this by using $timeout so everything is initialized
        // properly
        $timeout(function() {
          console.log("Projects", $rootScope.Projects);
          if($rootScope.Projects.length == 0) {
            console.log("first proj", $scope);
            $scope.projectModal.show();
          }
        });
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
