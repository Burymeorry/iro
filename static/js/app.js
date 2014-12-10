;(function (angular) { 'use strict';
  angular.module('iro', [
    'kTap',
    'ngAnimate',
    'angular-loading-bar',
    'ui.router',
    'iro.home',
    'iro.video',
    'iro.music',
    'iro.wallpaper',
    'iro.news',
    'iro.services.navbar'
  ]).config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '/static/templates/home.html',
        controller: 'HomeCtrl'
      })
      .state('video', {
        url: '/video',
        templateUrl: '/static/templates/video.html',
        controller: 'VideoCtrl'
      })
      .state('music', {
        url: '/music',
        templateUrl: '/static/templates/music/index.html',
        controller: 'MusicCtrl'
      })
      .state('music.play', {
        url: '/:name',
        templateUrl: '/static/templates/music/play.html',
        controller: 'MusicPlayCtrl'
      })
      .state('news', {
        url: '/news',
        templateUrl: '/static/templates/news/index.html',
        controller: 'NewsCtrl'
      })
      .state('news.detail', {
        url: '/:id',
        templateUrl: 'static/templates/news/detail.html',
        controller: 'NewsDetailCtrl'
      })
      .state('article', {
        url: '/article',
        template: 'article'
      })
      .state('wallpaper', {
        url: '/wallpaper',
        templateUrl: '/static/templates/wallpaper/index.html',
        controller: 'WallpaperCtrl'
      })
      .state('admin.login', {
        url: '/admin/login',
        template: '<k-login id="login"></k-login>',
        controller: 'LoginCtrl'
      })
      .state('register', {
        url: '/register',
        templateUrl: '/static/templates/register.html'
      });

    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true).hashPrefix('!');
  }]).controller('MainCtrl', ['$scope' ,'$state', 'musicPlayer', '$window', 'navbar',
  function ($scope ,$state, musicPlayer, $window, navbar) {
    $scope.setUser = function (user) {
      if ($scope.$$phase) {
        $scope.user = user; 
      } else {
        $scope.$apply(function () {
          $scope.user = user;    
        });
      }
    };

    $scope.stateGo = function (to, params, options) {
      $state.go(to, params, options);
    };

    $scope.backHistory = function () {
      $window.history.back();
    };

    $scope.openWindow = function (href) {
      $window.open(href);
    };

    $scope.global = {
      get customWallpaperSrc() {
        if (!$state.includes('music') && musicPlayer.paused) {
          return null;
        }
        if (!musicPlayer.currentMusic) {
          return null;
        }
        return musicPlayer.currentMusic.bgSrc;
      },
      title: null
    };

    Object.defineProperty($scope, 'navbarCustomBackgroundColor', {
      get: function () {
        return navbar.customBackgroundColor;
      }
    });
  }]).directive('html', ['$window', '$document', '$state', '$timeout', function ($window, $document, $state, $timeout) {
    var document = $document[0];

    return {
      restrict: 'E',
      link: function (scope, element, attrs, controller) {
        bindEvents();

        scope.$on('$stateChangeSuccess', function (e, toState, toParams, fromState) {
          if (!$state.includes(fromState.name) && fromState.name !== 'home' && !fromState.abstract) {
            element.addClass('state-back');
          } else {
            element.removeClass('state-back');
          }
        });

        // 修复iPad ios7下的高度异常
        if (navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i)) {
          $('html').addClass('ipad ios7');
        }

        $($window)
          .on('resize', function () {
            if ($window.innerWidth / $window.innerHeight >= 4 / 3) {
              $('html').removeClass('high-screen').addClass('wide-screen');
            } else {
              $('html').removeClass('wide-screen').addClass('high-screen');
            }
            if ($('html').hasClass('ipad ios7')) {
              $('body').height(window.innerHeight);
            }
          })
          .triggerHandler('resize');

        var wallpaperSrc = '/static/images/wallpaper.jpg';

        var xhr = new XMLHttpRequest();
        xhr.open('GET', wallpaperSrc);
        xhr.responseType = 'blob';
        xhr.onprogress = function (e) {
          var percent = e.loaded / e.total;

          $('#loading_cover .progress-bar').css('width', (percent * 100) + '%');
        };
        xhr.onload = function () {
          $('#loading_cover .progress-bar').css('animation', 'fade-out .8s .4s forwards');
          $window.wallpaperBlob = this.response;
          scope.wallpaperSrc = window.URL.createObjectURL(this.response);
          $timeout(function () {
            scope.loaded = true;
          }, 800);
        };
        xhr.send();

        function bindEvents() {
          $document
            .on('dragstart', function (e) {
              e.preventDefault();
            })
            .on('touchmove', function (e) {
              e.preventDefault();
            })
            .on('mouseenter', '.hoverable', function (e) {
              $(e.currentTarget).addClass('hover');
            })
            .on('mouseleave', '.hoverable', function (e) {
              $(e.currentTarget).removeClass('hover');
            })
            .on('touchstart mousedown', '.activable', function (e) {
              $(e.currentTarget).addClass('active');
            })
            .on('touchend touchcancel mouseup mouseleave', '.activable', function (e) {
              $(e.currentTarget).removeClass('active');
            })
            // .on('touchstart touchend touchmove click tap mousedown mouseup', function (e) {
            //     $('.container').append(e.type + '<br />');
            // })
            // .on('ktap', 'a', function (e) {
            //   // if (e.pointerType === 'touch' && $(e.currentTarget).attr('href')) {
            //     $(e.currentTarget).trigger('click');
            //   // }
            // })
            .on('mousedown mouseup click touchstart touchend', function (e) {
              if (e.isTrigger === 3) {
                return;
              }

              var $target = $(e.target);
              if ($target.css('user-select') !== 'none' && $target.is('.event-default, .event-default *')) {
                return;
              }

              e.preventDefault();
            });
        }
      }
    };
  }]).config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
  }]);
})(angular);