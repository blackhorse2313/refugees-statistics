angular.module('distanceModule', [])
    .controller('distanceCtrl', ['$scope', '$http', function($scope, $http) {
        
        var i, j;
        var scale = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];
        $http.get('data/total_applicants_each_year.json')
            .then(function(res) {
                var data = res.data.data;

                
            });


    }]);

