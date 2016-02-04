var app = angular.module('randomayatApp', ['ngRoute','ngAnimate','angular-loading-bar','720kb.socialshare']);

app.config(function($httpProvider,cfpLoadingBarProvider,$compileProvider,$routeProvider, $locationProvider,$provide) {
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
  cfpLoadingBarProvider.spinnerTemplate = '<div class="loading">Loading&#8230;</div>';
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);

  $routeProvider.
      when('/', {templateUrl: 'templates/index.tpl.html', controller: 'IndexCtrl' }).
      when('/liat-img/:id', {templateUrl: 'templates/liat.tpl.html', controller: 'LiatCtrl' }).
      when('/about-us', {templateUrl: 'templates/about.tpl.html'}).
      when('/privacy-policy', {templateUrl: 'templates/privacy-policy.tpl.html' }).
      otherwise({redirectTo: '/'});
      $locationProvider.html5Mode(true);
      //$locationProvider.hashPrefix('!');
});

app.directive('ngRandomayat',[function(){
        return {
            restrict: 'A',
            link: function ($scope,element,attributes) {
                $scope.createdimg = function() {
                     html2canvas(element,{
                         onrendered: function (canvas) {
                            $scope.imgc= canvas.toDataURL("image/png");
                            //document.getElementById("imgpath").setAttribute("src", $scope.imgc);
                         }
                     });
                 };
                 $scope.$on('createdimg',function(event){
                    $scope.createdimg();
                });
             }
         };
}]);
app.run(function($window) {
  $window.fbAsyncInit = function() {
    FB.init({
      appId: '1661318324106310',
      cookie: true,
      xfbml: true
    });
  };
      // load the Facebook javascript SDK
  (function(d){
    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) {return;}js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js"; ref.parentNode.insertBefore(js, ref);
  }(document));
});


app.directive('ngKomen', ['$timeout', function($timeout) {
  //http://stackoverflow.com/questions/23516305/facebook-comment-plugin-angularjs
   return {
     restrict: 'A',
     link: function(scope, elem, attr) {
       attr.$observe('pageHref', function (newValue) {
          elem.html('<div class="fb-comments" data-href="'+newValue+'" data-numposts="5"></div>');
          $timeout(function(){ FB.XFBML.parse(elem[0]);});
      });
     }
   };
 }]);

app.directive('script', function() {
   return {
     restrict: 'E',
     scope: false,
     link: function(scope, elem, attr) {
       if (attr.type==='text/javascript-lazy'){
         var s = document.createElement("script");
         s.type = "text/javascript";
         var src = elem.attr('src');
         if(src!==undefined){ s.src = src;
         }else{
         var code = elem.text();
         s.text = code;
         }
         document.head.appendChild(s);
         elem.remove();
       }
     }
   };
 });

app.controller('IndexCtrl', function($rootScope, $http,$location, $scope, $sce, $timeout, cfpLoadingBar,$httpParamSerializerJQLike){
      $scope.kolor = 'defcolor';
      $scope.generate = function() {
        $http.get("http://crossorigin.me/http://www.mahesajenar.com/scripts/ayat.php?r=0&n=100")
        .success(function(respone){
              var split = respone.split('</strong>');
              var ayat = split[0].replace('document.write("' || '&quot;','').replace('<strong>','');
              var surat = ayat.split('<br />');
              $rootScope.ayat = surat[0].replace(/&quot;/g,'');
              $rootScope.qs = surat[1];
              $rootScope.qsc = $rootScope.qs.replace(/\(|\)/g,"");
              $timeout(function(){
                    document.getElementById("wow").style.borderWidth = "5px";
                    $scope.$broadcast('createdimg');
              },100);
        })
        .error(function(err){
            alert('server down');
        });
      };
      $scope.ganti = function(col){
          $scope.kolor = col;
          document.getElementById("wow").style.borderWidth = "5px";
          $timeout(function(){
              $scope.$broadcast('createdimg');
          },100);
      };
      $scope.shareimg = function (basex,qs,ayat){
        var req = {
              method: 'POST',
              url: 'http://localhost/wow',
              data: $httpParamSerializerJQLike({'imgbase64': basex, 'qs': qs, 'ayat': ayat}),
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
         };
        $http(req).success(function(data){
              var link = data.link.replace('\r\n','');
              var id  = link.split('/');
              $scope.linkimg = link;
              console.log(link);
              $location.url('/liat-img/'+id[4]);
        }).error(function(data){
              alert('Sorrry ! server Down');
        });
      };

     $scope.getimg = function(str){
            return str.replace('http://', '');
      };
     $scope.start = function() {
              cfpLoadingBar.start();
      };

     $scope.complete = function () {
              cfpLoadingBar.complete();
      };

     $scope.start();
     $scope.fakeIntro = true;
     $timeout(function() {
          $scope.complete();
          $scope.fakeIntro = false;
     }, 1250);

});

app.controller('LiatCtrl', function($routeParams, $http,$location,$scope, $timeout, cfpLoadingBar){
    var id = $routeParams.id;
    var url ="https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fpostimg.org%2Fimage%2F"+id+"%22%20and%0A%20%20%20%20%20%20xpath%3D'%2F%2Fhtml%2Fbody%2Fcenter%2Fimg'&format=json&diagnostics=true&callback=";
    var bot = "(googlebot\/|googlebot|crawler|spider|robot|crawling|facebook/i)";
    var re = new RegExp(bot, 'i');
    if (re.test(navigator.userAgent)) {
        console.log('the user agent is a crawler!');
    }else{
        $http.get(url).success(function(data) {
            var img = data.query.results.img;
            console.log(img.src);
            $scope.imgpath =  img.src;
            $scope.pathid = $routeParams.id;
        }).error(function (data) {
            alert('Sorrry ! server Down');
        });
    }
});
