var App = angular.module('notesApp', [])

App.controller('MainCtrl', function($log, $scope, $http, $filter) {
	  $http.get('data.json')
         .then(function(res){
          $scope.todos = res.data;
          });
      var self = this;

      self.test = function(){console.log($scope.todos)};


		self.logStuff = function() {
		console.log($scope.data);
 		};

 })