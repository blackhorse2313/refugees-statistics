angular.module('ivApp', ['ngRoute', 'angularAwesomeSlider', 'gdpModule','countriesModule','distanceModule','timelineModule'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/home.html'
            })
            .when('/timeline', {
                templateUrl: 'views/timeline.html',
                controller: 'timelineCtrl'
            })
            .when('/gdp', {
                templateUrl: 'views/gdp.html',
                controller: 'gdpCtrl'
            })
            .when('/distance', {
                templateUrl: 'views/distance.html',
                controller: 'distanceCtrl'
            })
            .when('/countries', {
                templateUrl: 'views/countries.html',
                controller: 'countriesCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .controller('navCtrl', ['$scope', '$location', function($scope, $location) {

        $scope.expanded = false;

        $scope.navLinks = [{
            navPath: 'countries',
            text: 'Major Countries'
        }, {
            navPath: 'timeline',
            text: 'Timeline'
        }, {
            navPath: 'gdp',
            text: 'GDP'
        }, {
            navPath: 'distance',
            text: 'Distance'
        }];

        $scope.isActive = function(viewLocation) {
            return viewLocation === $location.path();
        };
    }])
    // Move to controller for main page
    .controller('dataSrcCtrl', ['$scope', function($scope) {

        $scope.dataSources = [{
            attribute: 'Refugees',
            link: 'http://appsso.eurostat.ec.europa.eu/nui/show.do',
            linkName: 'http://ec.europa.eu/eurostat/en'
        }, {
            attribute: 'GDP',
            link: 'http://data.worldbank.org/indicator/NY.GDP.PCAP.CD/countries?order=wbapi_data_value_2014%20wbapi_data_value%20wbapi_data_value-last&sort=desc&display=default',
            linkName: 'http://data.worldbank.org'

        }, {
            attribute: 'Distance',
            link: 'http://www.cepii.fr/cepii/en/bdd_modele/presentation.asp?id=6',
            linkName: 'http://www.cepii.fr'
        }, {
            attribute: 'ISO codes',
            link: 'http://datahub.io/dataset/iso-3166-1-alpha-2-country-codes/resource/7cd9a907-da04-4d2d-98cf-3ff793190ff4',
            linkName: 'http://datahub.io'
        }, {
            attribute: 'Population',
            link: 'http://ec.europa.eu/eurostat/tgm/table.do?tab=table&init=1&plugin=1&language=en&pcode=tps00001',
            linkName: 'http://ec.europa.eu/eurostat/en'
        }];
    }])
    ;
