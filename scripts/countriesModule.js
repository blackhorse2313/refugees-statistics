angular.module('countriesModule', [])
    .controller('countriesCtrl', ['$scope', '$http', function($scope, $http) {


        var emigrants;
        var immigrants;
        var displayImmigrants = [];
        var i, j;

        $scope.emigrantsButtonText = "Show more";
        $scope.immigrantsButtonText = "Show more";
        $scope.showBarImmigrants = true;
        $scope.showBarEmigrants = true;

        $scope.emigrantsButton = function() {
            if ($scope.emigrantsButtonText == "Show more") {
                $scope.emigrantsButtonText = "Show less";
                $scope.showBarEmigrants = false;
            } else {
                $scope.emigrantsButtonText = "Show more";
                $scope.showBarEmigrants = true;
            }
        };
        $scope.immigrantsButton = function() {
            if ($scope.immigrantsButtonText == "Show more") {
                $scope.immigrantsButtonText = "Show less";
                $scope.showBarImmigrants = false;
            } else {
                $scope.immigrantsButtonText = "Show more";
                $scope.showBarImmigrants = true;
            }
        };

        $http.get('data/applicants_gdp.json')
            .then(function(res) {
                immigrants = res.data.data;
                for (i = 0; i < immigrants.length; i++) {
                    if (immigrants[i].year == 2015) {
                        displayImmigrants.push(immigrants[i]);
                    }
                }
                displayImmigrants.sort(function(a, b) {
                    return b.applicants - a.applicants;
                });
                /* put d3 functions here */
                genHorizontalBarchart(displayImmigrants, "verbarImmigrants");
                genVerticalBarchart(displayImmigrants, "horbarImmigrants");
            });

        $http.get('data/emigrants.json')
            .then(function(res) {
                emigrants = res.data.data;
                /* put d3 funtions here */
                genHorizontalBarchart(emigrants, "verbarEmigrants");
                genVerticalBarchart(emigrants, "horbarEmigrants");
            });

        queue()
            .defer(d3.json, "data/world-110m.json")
            .defer(d3.tsv, "data/world-country-names.tsv")
            .await(genVisCountries);
    }]);

function genVisCountries(error, world, names) {
    if (error) throw error;

    genWorld(WorldType.EUROPE, world, names);
    genWorld(WorldType.EQUIRECTANGULAR, world, names);
}
