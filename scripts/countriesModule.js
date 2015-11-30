var ctrl = angular.module('countriesModule', [])
    .controller('countriesCtrl', ['$scope', '$http', function($scope, $http) {


        var emigrants;
        var immigrants;
        var displayImmigrants = [];
        var i, j;

        $scope.continents = [{
            continentCode: "AF",
            country: "Africa",
            applicants: 0
        }, {
            continentCode: "AS",
            country: "Asia",
            applicants: 0
        }, {
            continentCode: "EU",
            country: "Europe",
            applicants: 0
        }, {
            continentCode: "NA",
            country: "North America",
            applicants: 0
        }, {
            continentCode: "OC",
            country: "Oceania",
            applicants: 0
        }, {
            continentCode: "SA",
            country: "South America",
            applicants: 0
        }];

        $scope.selectedContinent = "";
        $scope.$watch('selectedContinent', function(newVal, oldVal) {
            if ($scope.selectedContinent !== "") {
                $scope.showContinents = false;
                $scope.showTop5Emigrants = false;
                $scope.emigrantsButtonText = "Continent overview";
                $scope.showSpecificContinent = true;
                $('#horbarEmigrants > svg').remove();

                function filterContinent(element, index, array) {
                    return (element.continent == $scope.selectedContinent);
                }

                var deisplayEmigrants = emigrants.filter(filterContinent);
                genVerticalBarchart(deisplayEmigrants, "horbarEmigrants");
            }
        });

        $scope.emigrantsButtonText = "Display by countinent";
        $scope.immigrantsButtonText = "Show more";
        $scope.showBarImmigrants = true;
        // display different views
        $scope.showTop5Emigrants = true;
        $scope.showContinents = false;
        $scope.showSpecificContinent = false;

        $scope.emigrantsButton = function() {
            if ($scope.showTop5Emigrants) {
                $scope.showContinents = true;
                $scope.showTop5Emigrants = false;
                $scope.emigrantsButtonText = "Show top 5";
            } else if ($scope.showContinents) {
                $scope.showContinents = false;
                $scope.showTop5Emigrants = true;
                $scope.emigrantsButtonText = "Display by countinent";
            } else {
                $scope.showContinents = true;
                $scope.showTop5Emigrants = false;
                $scope.emigrantsButtonText = "Show top 5";
                $scope.selectedContinent = "";
                $scope.showSpecificContinent = false;
            }
        };

        $scope.immigrantsButton = function() {
            if ($scope.immigrantsButtonText == "Show more") {
                $scope.immigrantsButtonText = "Show top 5";
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
                var top5countries = displayImmigrants.slice(0, 5);
                genHorizontalBarchart(top5countries, "verbarImmigrants");
                genVerticalBarchart(displayImmigrants, "horbarImmigrants");
            });

        $http.get('data/emigrants.json')
            .then(function(res) {
                emigrants = res.data.data;
                /* put d3 funtions here */
                var top5countries = emigrants.slice(0, 5);
                genHorizontalBarchart(top5countries, "verbarEmigrants");
                emigrants.forEach(function(country) {
                    $scope.continents.forEach(function(continent) {
                        if (country.continent == continent.continentCode) {
                            continent.applicants += country.applicants;
                        }
                    });
                });
                $scope.continents.sort(function(a, b) {
                    return b.applicants - a.applicants;
                });

                function isBigEnough(element, index, array) {
                    return (element.applicants >= 5000);
                }

                $scope.continents = $scope.continents.filter(isBigEnough);
                genHorizontalBarchart($scope.continents, "verbarContinents");

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

function change(code) {
    var scope = angular.element($("#verbarContinents")).scope();
    scope.$apply(function() {
        scope.selectedContinent = code;
    });
}

function selectCountry(code) {
    var scope = angular.element($("#verbarContinents")).scope();
    scope.$apply(function() {
        scope.selectedContinent = code;
    });
}
