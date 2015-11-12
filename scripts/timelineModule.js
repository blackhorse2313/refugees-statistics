angular.module('timelineModule', ['angularAwesomeSlider'])
    .controller('timelineCtrl', ['$scope', '$http', function($scope, $http) {

    $scope.yearValues = [];
    var scale = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];
    for (var s = 0;s<scale.length;s++){
    	var object={
    	year:scale[s],
    	applicants:0};
    	$scope.yearValues.push(object);
    }
     $http.get('data/total_applicants_each_year.json')
            .then(function(res) {
            	var data = res.data.data;
                for (var i=0;i<data.length;i++){
                	for (var j=0;j<$scope.yearValues.length;j++){
                		if (data[i].year==$scope.yearValues[j].year)
                		{
                			$scope.yearValues[j].applicants+=data[i].applicants;
                		}
                	}
                }
            });

        $scope.rangeValue = "2008;2015";
             $scope.options = {
            from: 2008,
            to: 2015,
            step: 1,
            scale: scale,
            css: {
                before: {
                    "background-color": "transparent"
                },
                default: {
                    "background-color": "transparent"
                },
                pointer: {
                    "background-color": "#337ab7"
                },
                range: {
                    "background-color": "#149bdf"
                } // use it if double value
            }
        };

        genVisYearTimeline($scope.yearValues);
    }]);

function genVisYearTimeline(data) {
	console.log(data);
}
