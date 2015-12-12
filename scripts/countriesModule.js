var ctrl = angular.module('countriesModule', [])
    .controller('countriesCtrl', ['$scope', '$http', function($scope, $http) {
        queue()
            .defer(d3.json, "data/world-110m.json")
            .defer(d3.tsv, "data/world-country-names.tsv")
            .await(genVisCountries);

        function genVisCountries(error, world, names) {
            if (error) throw error;

            // Create maps
            var europeMap = new World(WorldType.EUROPE, world, names);
            var equirectangularMap = new World(WorldType.EQUIRECTANGULAR, world, names);

            // Populate data for bar charts
            // Dataset loading also sets the initial filled countries on the corresponding map
            $scope.continents = [{
                continentCode: "AF",
                country: "Africa",
                applicants: 0,
                x: -400,
                y: -375,
                scale: 2.25
            }, {
                continentCode: "AS",
                country: "Asia",
                applicants: 0,
                x: -750,
                y: -250,
                scale: 2.25
            }, {
                continentCode: "EU",
                country: "Europe",
                applicants: 0,
                x: -675,
                y: -100,
                scale: 2.25
            }, {
                continentCode: "NA",
                country: "North America",
                applicants: 0,
                x: 0,
                y: 0,
                scale: 1
            }, {
                continentCode: "OC",
                country: "Oceania",
                applicants: 0,
                x: 0,
                y: 0,
                scale: 1
            }, {
                continentCode: "SA",
                country: "South America",
                applicants: 0,
                x: 0,
                y: 0,
                scale: 1
            }];

            var zoomFactorsTop5 = {
                x: -925,
                y: -400,
                scale: 3.25
            };

            var emigrants;
            var immigrants;
            var displayImmigrants = [];
            var i, j;

            var immigrantsTop5Countries;
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
                    immigrantsTop5Countries = displayImmigrants.slice(0, 5);
                    genHorizontalBarchart(immigrantsTop5Countries, "verbarImmigrants", europeMap);
                    genVerticalBarchart(displayImmigrants, "horbarImmigrants", europeMap);

                    europeMap.fillCountriesByApplicants(immigrantsTop5Countries);
                });

            var emigrantsTop5Countries;
            $http.get('data/emigrants.json')
                .then(function(res) {
                    emigrants = res.data.data;

                    /* put d3 funtions here */
                    emigrantsTop5Countries = emigrants.slice(0, 5);
                    genHorizontalBarchart(emigrantsTop5Countries, "verbarEmigrants", equirectangularMap);
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
                    genHorizontalBarchart($scope.continents, "verbarContinents", equirectangularMap);

                    //////////////////////////
                    var emigrantsEurope = [];
                    var emigrantsAsia = [];
                    var emigrantsAfrica = [];
                    emigrants.forEach(function(country) {
                        switch (country.continent) {
                            case "EU":
                                emigrantsEurope.push(country);
                                break;
                            case "AF":
                                emigrantsAfrica.push(country);
                                break;
                            case "AS":
                                emigrantsAsia.push(country);
                                break;
                            default:
                                break;
                        }
                    });

                    genVerticalBarchart(emigrantsEurope, "horbarEurope", equirectangularMap);
                    genVerticalBarchart(emigrantsAsia, "horbarAsia", equirectangularMap);
                    genVerticalBarchart(emigrantsAfrica, "horbarAfrica", equirectangularMap);

                    //////////////////////////

                    equirectangularMap.fillCountriesByApplicants(emigrantsTop5Countries);
                    equirectangularMap.zoomToRegion(zoomFactorsTop5.x, zoomFactorsTop5.y, zoomFactorsTop5.scale);
                });

            // Display different views
            // Button switching logic is also used for updating filled countries in maps
            var displayEmigrants;
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

                    displayEmigrants = emigrants.filter(filterContinent);
                    //genVerticalBarchart(displayEmigrants, "horbarEmigrants", equirectangularMap);

                    ///////////////////////////////////////
                    hideSpecificContinents();
                    switch ($scope.selectedContinent) {
                        case "EU":
                            $scope.showEurope = true;
                            break;
                        case "AF":
                            $scope.showAfrica = true;
                            break;
                        case "AS":
                            $scope.showAsia = true;
                            break;
                        default:
                            break;
                    }
                    //////////////////////////////////////////////

                    equirectangularMap.fillCountriesByApplicants(displayEmigrants);
                    for (var i = 0; i < $scope.continents.length; i++) {
                        var continent = $scope.continents[i];
                        if ($scope.selectedContinent == continent.continentCode) {
                            equirectangularMap.zoomToRegion(
                                continent.x,
                                continent.y,
                                continent.scale);
                            return;
                        }
                    };
                }
            });

            ///////////////////////////

            $scope.showEurope = false;
            $scope.showAfrica = false;
            $scope.showAsia = false;
            var hideSpecificContinents = function() {
                $scope.showEurope = false;
                $scope.showAfrica = false;
                $scope.showAsia = false;
            };

            //////////////////////////

            $scope.showContinents = false;
            $scope.showTop5Emigrants = true;
            $scope.showSpecificContinent = false;
            $scope.emigrantsButtonText = "Display by continent";

            $scope.emigrantsButton = function() {
                if ($scope.showTop5Emigrants) {
                    $scope.showContinents = true;
                    $scope.showTop5Emigrants = false;
                    $scope.emigrantsButtonText = "Show top 5";

                    equirectangularMap.fillCountriesByApplicants(emigrants);
                    equirectangularMap.zoomToRegion(0, 0, 1);
                } else if ($scope.showContinents) {
                    $scope.showContinents = false;
                    $scope.showTop5Emigrants = true;
                    $scope.emigrantsButtonText = "Display by continent";

                    equirectangularMap.fillCountriesByApplicants(emigrantsTop5Countries);
                    equirectangularMap.zoomToRegion(zoomFactorsTop5.x, zoomFactorsTop5.y, zoomFactorsTop5.scale);
                } else {
                    $scope.showContinents = true;
                    $scope.showTop5Emigrants = false;
                    $scope.selectedContinent = "";
                    hideSpecificContinents();
                    $scope.emigrantsButtonText = "Show top 5";

                    equirectangularMap.fillCountriesByApplicants(emigrants);
                    equirectangularMap.zoomToRegion(0, 0, 1);
                }
            };

            $scope.immigrantsButtonText = "Show more";
            $scope.showBarImmigrants = true;

            $scope.immigrantsButton = function() {
                if ($scope.immigrantsButtonText == "Show more") {
                    $scope.immigrantsButtonText = "Show top 5";
                    $scope.showBarImmigrants = false;

                    europeMap.fillCountriesByApplicants(processData(displayImmigrants));
                } else {
                    $scope.immigrantsButtonText = "Show more";
                    $scope.showBarImmigrants = true;

                    europeMap.fillCountriesByApplicants(immigrantsTop5Countries);
                }
            };
        }
    }]);

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
