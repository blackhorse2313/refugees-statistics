angular.module('countriesModule', [])
    .controller('countriesCtrl', ['$scope', '$http', function($scope, $http) {

        var emigrants;
        var immigrants;
        var i, j;

        $http.get('data/applicants_gdp.json')
            .then(function(res) {
                immigrants = res.data.data;
                var displayData = [];
                for (i = 0; i < immigrants.length; i++) {
                    if (immigrants[i].year == 2015) {
                        displayData.push(immigrants[i]);
                    }
                }
                displayData.sort(function(a, b) {
                    return b.applicants - a.applicants;
                });
                /* put d3 functions here */
                genHorizontalBarchart(displayData,"barImmigrants");
            });

        $http.get('data/emigrants.json')
            .then(function(res) {
                emigrants = res.data.data;
                /* put d3 funtions here */
                genHorizontalBarchart(emigrants,"barEmigrants");
            });
    }]);
