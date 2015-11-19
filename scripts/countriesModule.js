angular.module('countriesModule', [])
    .controller('countriesCtrl', ['$scope', '$http', function($scope, $http) {
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
