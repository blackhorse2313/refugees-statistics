angular.module('distanceModule', [])
    .controller('distanceCtrl', ['$scope', '$http', function($scope, $http) {
        
        var i, j;
        var scale = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];

        queue()
            .defer(d3.json, "data/world-110m.json")
            .defer(d3.tsv, "data/world-country-names.tsv")
            .await(genVisDistance);
    }]);

function genVisDistance(error, world, names) {
    if (error) throw error;

    genWorld(WorldType.EQUIDISTANT, world, names);
}
