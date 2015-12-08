angular.module('distanceModule', [])
    .controller('distanceCtrl', ['$scope', '$http', function($scope, $http) {
        queue()
            .defer(d3.json, "data/world-110m.json")
            .defer(d3.tsv, "data/world-country-names.tsv")
            .await(genVisDistance);

        function genVisDistance(error, world, names) {
            if (error) throw error;

            var equidistantMap = new World(WorldType.EQUIDISTANT, world, names);

            var i, j;
            $scope.countryList = [];
            $scope.data = [];
            var displayData = [];

            $scope.colors = d3.scale.linear()
                .range(["white", "#217DBB"]);

            $http.get('data/emigrants.json')
                .then(function(res) {
                    $scope.countryList = res.data.data;
                    for (i = 0; i < $scope.countryList.length; i++) {
                        if (i < 5) {
                            $scope.countryList[i].selected = true;
                        }
                    }
                    $scope.colors.domain(d3.extent($scope.countryList, function(d) {
                        return d.applicants;
                    }));

                    $http.get('data/distance.json')
                        .then(function(res) {
                            $scope.data = res.data.data;
                            updateData($scope.data);
                        });
                });

            var updateData = function() {
                var countryNameList = [];
                displayData = [];
                for (i = 0; i < $scope.countryList.length; i++) {
                    if ($scope.countryList[i].selected) {
                        countryNameList.push($scope.countryList[i].country);
                        var element = {
                            country: $scope.countryList[i].country,
                            values: []
                        };
                        displayData.push(element);
                    }
                }
                for (i = 0; i < $scope.data.length; i++) {
                    var index = countryNameList.indexOf($scope.data[i].source);
                    if (index != -1) {
                        displayData[index].values.push($scope.data[i]);
                    }
                }
                genDistanceScatterplot(displayData, equidistantMap);
            };

            $scope.check = function(iso) {
                for (i = 0; i < $scope.countryList.length; i++) {
                    if ($scope.countryList[i].iso2 == iso) {
                        if ($scope.countryList[i].selected) {
                            $scope.countryList[i].selected = false;
                        } else {
                            $scope.countryList[i].selected = true;
                        }
                    }
                }
                updateData($scope.data);
            };

            $scope.focusButton = function(iso) {
                for (i = 0; i < $scope.countryList.length; i++) {
                    if ($scope.countryList[i].iso2 == iso) {
                        $scope.countryList[i].focus = true;
                        
                        // Retrieve origin country
                        var originName = $scope.countryList[i].country;
                        var originCentroid = equidistantMap.computeCentroidByName(originName);

                        // Retrieve destination countries (adapted from distanceScatterplot)
                        var destinations;
                        for (var i = 0; i < displayData.length; i++) {
                            if (displayData[i].country === originName) {
                                destinations = displayData[i].values;
                                destinations = destinations.slice(0, 10);
                                break;
                            }
                        }

                        // Rotate map to origin country
                        equidistantMap.drawFlux(originCentroid, destinations);
                        equidistantMap.rotateToCountryByName(originCentroid, originName);
                    } else {
                        $scope.countryList[i].focus = false;
                    }
                }
            };
        }
    }]);
