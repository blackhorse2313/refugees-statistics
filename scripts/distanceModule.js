angular.module('distanceModule', [])
    .controller('distanceCtrl', ['$scope', '$http', function($scope, $http) {


        var i, j;
        $scope.countryList = [];
        $scope.data = [];

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
            var displayData = [];
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
            console.log(displayData);
            genDistanceScatterplot(displayData);
        };

        $scope.check = function(iso) {
            console.log(iso);
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


    }]);
