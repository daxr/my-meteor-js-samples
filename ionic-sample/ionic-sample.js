
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
  Meteor.subscribe('Tasks');
  Meteor.subscribe('Projects');

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

        // $collection('Tasks', 'Tasks', null, $rootScope,{},{sort:{updatedAt:-1}});
        // $collection('Projects', 'Projects', null, $rootScope,{},{sort:{updatedAt:-1}});
        $collection('Tasks', $rootScope,{},{sort:{updatedAt:-1}});
        $collection('Projects', $rootScope,{},{sort:{updatedAt:-1}});
        $scope.toggleProjects = function() {
          $scope.sideMenuController.toggleLeft();
        };

        Deps.autorun(function() {
            $scope.safeApply(function () {

              if(Session.get('activeProject')){
                 console.log('autorun', Tasks.find({projectId: Session.get('activeProject')._id}).fetch());
                 $scope.activeTasks = Tasks.find({projectId: Session.get('activeProject')._id}).fetch();
              }
            });
        });

        $rootScope.title2 = "another title";

        // Create and load the Modal
        $ionicModal.fromTemplateUrl('newTask', function(modal) {
          $scope.taskModal = modal;
        }, {
          scope: $scope,
          animation: 'slide-in-up'
        });

        // Called when the form is submitted
        $scope.createTask = function(task) {

          if(!Session.get('activeProject') || !task){
            return;
          }
          $rootScope.Tasks.add({
            title: task.title,
            projectId: Session.get('activeProject')._id
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
        $ionicModal.fromTemplateUrl('newProject', function(modal) {
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
          Projects.insert({
            title: project.title,
          }, function(err, _id){
            Session.set('activeProject', Projects.findOne({_id:_id}));
          });
          

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
        // $timeout(function() {
        //   console.log("Projects", Projects.find().count());
        //   if($rootScope.Projects.length == 0) {
        //     console.log("first proj", $scope);
        //     $scope.projectModal.show();
        //   }else{
        //     Session.set('activeProject', Projects.findOne({},{sort:{updatedAt:-1}}));
        //   }
        // });
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
    Meteor.publish("Tasks", function () {
      return Tasks.find({});
    });
    Meteor.publish("Tasks1", function () {
      return Tasks.find({projectId:"g4ciJLheF7fFSJkeK"});
    });
    Meteor.publish("Projects", function () {
      return Projects.find({});
    });



  });
}
