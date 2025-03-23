var app = angular.module('notesApp', [])
//add data dependency to the module
//follow these instructions https://docs.angularjs.org/tutorial/step_11

// Run

app.run(function () {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  console.log(firstScriptTag);

  var tag = document.createElement('script');
  tag.src = "https://w.soundcloud.com/player/api.js"
  var secondScriptTag = document.getElementsByTagName('script')[0];
  secondScriptTag.parentNode.insertBefore(tag, secondScriptTag);
  console.log(secondScriptTag);
  widgetIframe = document.getElementById('sc-widget');

});

// Main Ctrl

app.controller('MainCtrl', function($log, $scope, $http, $filter, $window, myService) {
	$scope.loadMoreTweets = function(){
		console.log("loading tweets");
	}

	$scope.searchText = null;
	myService.getData().then(function(data) {
	//pull data from service
	//set variables
        $scope.todos = data;
        $scope.todosbak = data;
        $scope.SC = $window.SC;
    });
	setTimeout(function(){console.log($scope.todos)},300)

    var self = this;

    self.logNowPlaying = function(){myService.logNowPlaying()}
	self.playPrevious = function(){myService.playPrevious()}
	self.playNext = function(){myService.playNext()}
    self.randomSwitcher = function(){myService.randomSwitcher()};
    self.newtodos = function(){
 			myService.favSwitcher();
 			$scope.todos = myService.newtodos()
    }

  	self.addHistory = function(index){myService.addHistory(index)};

  	self.clearHistory = function(){myService.clearHistory()};

  	self.logHistory = function(){myService.logHistory()};

  	self.logSearch = function(){
				myService.logSearch();	
			};

	$scope.$watch(function(scope) { return scope.searchText },
              	function(){
              				console.log('searchText has changed!');
              				myService.clearHistory();
          					});

  	init();
    function init() {
      $scope.youtube = myService.getYoutube();
      //$scope.results = myService.getResults();
      //$scope.upcoming = myService.getUpcoming();
      //$scope.history = myService.getHistory();
      $scope.playlist = true;
    }

    self.playSomething = function(){myService.playSomething(index)};
    //self.playSomething = function(){myService.playSomething(index, $scope.data.length)};
    self.pausePlayers = function(){myService.pausePlayers()};
    self.stopPlayers = function(){myService.stopPlayers()}
    self.playPlayers = function(){myService.playPlayers()}

    //links in tracklists
    self.clicked = function (index) {
    	console.log(index);
    	track = $scope.data[index];
    	console.log(track);
    	console.log(track.source);
    	myService.launchPlayer(track, index);
    }
    self.playRandom = function () {
    	myService.playRandom();
    }

    self.logFavourite = function(index){myService.logFavourite($scope.data[index])}
//end
//

 })
////////////////////////////////////////////////////////////////////////////////////// 
// ////////////////////////////////////////////////////////////////////////////////////// 
// ////////////////////////////////////////////////////////////////////////////////////// 
// ////////////////////////////////////////////////////////////////////////////////////// 
// ////////////////////////////////////////////////////////////////////////////////////// 
// ////////////////////////////////////////////////////////////////////////////////////// 
// ////////////////////////////////////////////////////////////////////////////////////// 
// ////////////////////////////////////////////////////////////////////////////////////// 
// ////////////////////////////////////////////////////////////////////////////////////// 
// ////////////////////////////////////////////////////////////////////////////////////// 

//myService

app.service('myService', function ($window, $rootScope, $log, $http, $q){

	var self = this;

	//pull data from file
	//
	self.getData = function() { 
	    var defer = $q.defer();
	        $http({method: 'GET', url: 'data/data.json', data: {}})
	            .success(function(data, status, headers, config) {
	                // return tracklist data
	                //
	                defer.resolve(data);
	                todosbak = data;
			console.log("data");
			console.log(todosbak)
	                    })
	            .error(function(data, status, headers, config) {
	                // called asynchronously if an error occurs
	                // or server returns response with an error status.
	                window.data = data;
	            });

	    return defer.promise;
		}


	var youtube = {
	    ready: false,
	    player: null,
	    playerId: null,
	    videoId: null,
	    videoTitle: null,
	    playerHeight: '150',
	    playerWidth: '55%',
	    state: 'stopped'
	  };

	$rootScope.history = {"played":[],"playedIds":[]};
	$rootScope.playingIndex = [];
	self.addHistory = function(index){
		console.log("index", index, $rootScope.favSwitchState)
		if ($rootScope.favSwitchState == false){
			source = "newtodos";
	} else {
			source = "todos";
	}
		$rootScope.history["played"].push({index:index, src:source});
		$rootScope.history["lastPlayed"] = {index:index, src:source};
		//console.log(self.newtodos())
		//playedIds = JSON.parse(self.newtodos()[index]['Id'])
		//playedIds.push(self.newtodos()[index]['Id'])
		if ($rootScope.history["playedIds"].indexOf(self.newtodos()[index]['Id']) == -1)
		{
			$rootScope.history["playedIds"].push(self.newtodos()[index]['Id']);
		}
	}

	self.playRandom = function(){
		var x = Math.floor(Math.random() * todosbak.length);
		track = todosbak[x];
		self.launchPlayer(track, x);
	}

	self.clearHistory = function(){$rootScope.history = {played:[], lastPlayed:null, playedIds:[]}};

	self.logHistory = function(){
		console.log($rootScope.history);
		console.log($rootScope.history.playedIds);
	};

	self.updatePlayingIndex = function(index){$rootScope.playingIndex = index};
		

	 $window.onYouTubeIframeAPIReady = function () {
	    $log.info('Youtube API is ready');
	    youtube.ready = true;
	    self.bindPlayer('player');
	    self.loadPlayer();
	    $rootScope.$apply();
  	};

  	function onYoutubeReady (event) {
	    $log.info('YouTube Player is ready');
	    //youtube.player.cueVideoById(history[0].id);
	    //youtube.videoId = history[0].id;
	    //youtube.videoTitle = history[0].title;
	  }
	  
	function onYoutubeStateChange (event) {
	    if (event.data == YT.PlayerState.PLAYING) {
	      youtube.state = 'playing';
	    } else if (event.data == YT.PlayerState.PAUSED) {
	      youtube.state = 'paused';
	    } else if (event.data == YT.PlayerState.ENDED) {
	      console.log("youtube track finished");
	      youtube.state = 'ended';
	      console.log("nowPlaying indexwww", $rootScope.nowPlaying['Id'], typeof $rootScope.nowPlaying.Id);
	      self.playSomething($rootScope.nowPlaying["index"]);
	      //self.playSomething($rootScope.nowPlaying["index"], self.newtodos().length);
	      //self.launchPlayer(upcoming[0].id, upcoming[0].title);
	      //self.archiveVideo(upcoming[0].id, upcoming[0].title);
	      //self.deleteVideo(upcoming, upcoming[0].id);
	    }
	    $rootScope.$apply();
	 }

  	self.bindPlayer = function (elementId) {
	    $log.info('Binding to ' + elementId);
	    youtube.playerId = elementId;
	  };

	self.createPlayer = function () {
    $log.info('Creating a new Youtube player for DOM id ' + youtube.playerId + ' and video ' + youtube.videoId);
    return new YT.Player(youtube.playerId, {
      height: youtube.playerHeight,
      width: youtube.playerWidth,
      playerVars: {
        rel: 0,
        showinfo: 0
      },
      events: {
        'onReady': onYoutubeReady,
        'onStateChange': onYoutubeStateChange
      }
    });
  };

	self.loadPlayer = function () {
	    if (youtube.ready && youtube.playerId) {
	      if (youtube.player) {
	        youtube.player.destroy();
	      }
	      youtube.player = self.createPlayer();
	    }
	  };

	self.pausePlayers = function(){
		youtube.player.pauseVideo();
		widget.pause();
	}
	self.stopPlayers = function(){
		youtube.player.stopVideo();
		widget.pause();
		widget.seekTo(0);
	}
	self.playPlayers = function(){
		console.log($rootScope.nowPlaying);
		if ($rootScope.nowPlaying.source == "YT") {
			console.log("playing YT");
			youtube.player.seekTo(0);
			youtube.player.playVideo();
		} else if ($rootScope.nowPlaying.source == "SC") {
			console.log("playing SC")
			widget.seekTo(0);
			widget.play();
		}
		// youtube.player.stopVideo();
		// widget.pause();
		// widget.seekTo(0);
	}

	self.newtodos = function(){

    	if ($rootScope.favSwitchState == true){
	    		console.log("returning ui todos");

		    	list = JSON.parse(localStorage.tracks);
		    	var todos = [];
		    	for (each in list){
						    		todos.push(list[each])
						    		};
				console.log('$rootScope.favList = todos;',$rootScope.favList = todos)
				$rootScope.favList = todos;
				return todos;
    	} else {
    		console.log("returning todosbak");
    		return todosbak;
    	}
    }
    self.logSearch = function(){
    	console.log("newtodos",$rootScope.favList);
    }
    $rootScope.lastPlayedClicks = 0
    self.playPrevious = function(){
    	$rootScope.historyLength = $rootScope.history.playedIds.length;
    	//console.log('$rootScope.historyLength',$rootScope.historyLength);
    	$rootScope.lastPlayedClicks +=1;
    	//console.log('lastPlayedClicks',$rootScope.lastPlayedClicks);
    	lastPlayedIndex = $rootScope.historyLength - $rootScope.lastPlayedClicks;
    	console.log('$rootScope.favList',$rootScope.favList);
    	console.log('todosbak',todosbak)

    	if ($rootScope.favSwitchState == true){
    		nextPlaylist = $rootScope.favList
    	} else {
    		nextPlaylist = todosbak;
    	}
    	self.launchPlayer(nextPlaylist[lastPlayedIndex], lastPlayedIndex);
    }

    self.playNext = function(){
    	if ($rootScope.lastPlayedClicks > 0){
    		$rootScope.history.playedIds[$rootScope.history.playedIds.length - $rootScope.lastPlayedClicks];
    		$rootScope.lastPlayedClicks -=1
    	} else {
    		self.playSomething($rootScope.nowPlaying["index"]);
    	}
    	self.playSomething($rootScope.nowPlaying["index"]);
    }

    self.nextPlaylist = function(){}

	self.playSomething = function (index) {
		console.log("nowPlaying['index']",$rootScope.nowPlaying['Id'])
		// need to reset index when fav button is clicked!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		self.pausePlayers();
		nextPlaylist = self.newtodos();
		console.log('nextPlaylist',nextPlaylist)
		console.log("blah blahsdjkhdfkhadkfh", nextPlaylist.length)
		//random switch + fav switch is true
		if ($rootScope.randomSwitchState == true){
			//random switch + fav switch is true
			var x = Math.floor(Math.random() * nextPlaylist.length);
			// console.log('$rootScope.history.playedIds',$rootScope.history.playedIds)
			// console.log('nextPlaylist[x]',nextPlaylist[x]['Id'])
			if ($rootScope.history.playedIds.indexOf(nextPlaylist[x]['Id']) >= 0 && 
				$rootScope.history.playedIds.length < nextPlaylist.length){
				console.log("track has been played");
				console.log($rootScope.history.playedIds);
				self.playSomething(x);
			}
		} else {
			var x = index + 1;
		}
		console.log("nextPlaylist,x",nextPlaylist, x);
		self.launchPlayer(nextPlaylist[x], x);
		self.addHistory(x);
	}




			// if ($rootScope.favSwitchState == true) {
			// 	var x = Math.floor((Math.random() * newtodos().length));
			// } else {
			// 	var x = Math.floor((Math.random() * self.newtodos().length));
			// 	newtodos = self.newtodos();
			// 	console.log("self.newtodos.length",newtodos, newtodos.length)
			// }
			//  //var x = Math.floor((Math.random() * length));
			//  console.log("randomSwitchState is true, playing next",x)
		// } else {
		// 	var x = index+1;
		// }
		// if ($rootScope.favSwitchState == false){
		// 	nextTrack = todosbak;
		// } else {
		// 	nextTrack = self.newtodos();
		// }
	 //    console.log("playing something");
	 //    console.log("nextTrack",nextTrack, x)
	 //    nextTrack2 = nextTrack[x];
	 //    console.log("self.newtodos()[x]",nextTrack2)
	 //    self.launchPlayer(nextTrack2, x);
  //   };

	self.launchPlayer = function (track, index) {
		console.log("launchPlayer called");
	 	$rootScope.nowPlaying = track;
	 	$rootScope.nowPlaying.index = index;
	 	console.log('$rootScope.nowPlaying.Id yes',$rootScope.nowPlaying.id);
		console.log("track: ");
		console.log(track.id);	
		console.log("index: ", index)
	 	//self.addHistory(track);

	 	self.pausePlayers();
		if (track.source == "YT"){
			youtube.player.loadVideoById(track.id);
			youtube.videoId = track.id;
			youtube.videoTitle = track.title;
			return youtube;
		}
		else if (track.source = "SC"){
			console.log("launching SC", track.id, track.title);
			widget.load("https://api.soundcloud.com/tracks/"+track.id, {auto_play:true});
			youtube.videoTitle = track.title;
		}
	  }

	self.getYoutube = function () {
		return youtube;
	  };
	// self.launchPlayerSC = function (id, title) {
	// 	console.log("launching SC", id, title);
	//     widget.load(id, {auto_play:true});
	//     youtube.videoTitle = title;
	//   };
	  //initialize widget
	  //initialize widget
	setTimeout(function(){
							console.log("initializing widget")
							widget = SC.Widget('sc-widget');
							console.log(widget);
							widget.bind(SC.Widget.Events.READY, function() {widget.play()});
							widget.bind(SC.Widget.Events.FINISH, function(){
								console.log("track finisheddd");
								self.playSomething($rootScope.nowPlaying["index"]);
								console.log("track finished");
							})
							}
							,2800);

	self.logTrack = function(){console.log($rootScope.nowPlaying.source == "YT")}


	self.updateFavs = function(){
						$rootScope.fap = JSON.parse(localStorage.getItem('ids'));
						favs = {}
						for (each in $rootScope.fap){
								console.log("fap", $rootScope.fap[each])
								favs[$rootScope.fap[each]] = 'true'
								console.log(favs)
							}
						$rootScope.fap = favs
					}
	self.updateFavs()
	self.logNowPlaying = function(){console.log($rootScope.nowPlaying['source'])}
	self.logFavourite = function(item){

							console.log(item);
							blah = JSON.stringify(localStorage.getItem('ids'))
							itemId = item['Id']
							if (blah.match(itemId) != null){

									//console.log("id found.. removing item")

									idslist = JSON.parse(localStorage.getItem('ids'))
									var index = idslist.indexOf(itemId);
									//console.log(index);
									idslist.splice(index,1)
									localStorage.setItem('ids', JSON.stringify(idslist))

									trackslist = JSON.parse(localStorage.getItem('tracks'))
									//console.log('trackslist',trackslist, index)
									trackslist.splice(index,1)
									localStorage.setItem('tracks', JSON.stringify(trackslist))
									//console.log(index)

								} else {

								var localList = JSON.stringify(localStorage.getItem('tracks'));
								//console.log("found match...",localList.match(item['Id']))
								if (localList == "null"){
										//console.log("list is empty");
										localStorage.setItem('tracks', JSON.stringify([item]));
										localStorage.setItem('ids', JSON.stringify([item['Id']]))
									} else if (localList.match(item['Id']) == null){
										//console.log("item not in storage");
										tempList = JSON.parse(localStorage.getItem('tracks'));
										tempList.push(item);
										tempIds = JSON.parse(localStorage.getItem('ids'));
										tempIds.push(item['Id']);
										//console.log("adding item to storage");
										localStorage.setItem('tracks', JSON.stringify(tempList))
										localStorage.setItem('ids', JSON.stringify(tempIds))

									}
							}
							self.updateFavs();
						}

	$rootScope.favSwitchState = false;
	console.log("blah",$rootScope.favSwitchState)
	self.favSwitcher = function(){
		//console.log("fav switched to ",$rootScope.favSwitchState)
		if ($rootScope.favSwitchState == false){
			$rootScope.favSwitchState = true;
		} else {
			$rootScope.favSwitchState = false;
			}
		console.log("fav switched to ", $rootScope.favSwitchState);
		return $rootScope.favSwitchState;
	}
	//self.favSwitcher()

	$rootScope.randomSwitchState = false;
	//console.log("blah",$rootScope.randomSwitchState)
	self.randomSwitcher = function(){

		if ($rootScope.randomSwitchState == true){
			$rootScope.randomSwitchState = false;
		} else {
			$rootScope.randomSwitchState = true;
			}
		console.log("random switched to ", $rootScope.randomSwitchState);
		return $rootScope.randomSwitchState;
	}
})

app.directive("scroll", function ($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
             if (this.pageYOffset >= 150) {
                 scope.boolChangeClass = true;
                 console.log('Scrolled below header.');
             } else {
                 scope.boolChangeClass = false;
                 console.log('Header is in view.');
             }
            scope.$apply();
        });
    };
});
