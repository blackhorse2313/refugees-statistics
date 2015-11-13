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

    svg = d3.select("overviewLinechart").append("svg").attr("width", width).attr("height", height).append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

    var daten = [
        {'spieltag': 1, 'tore': 3},
        {'spieltag': 2, 'tore': 5},
        {'spieltag': 3, 'tore': 2},
        {'spieltag': 4, 'tore': 7},
        {'spieltag': 5, 'tore': 12},
    ]

     var width = 300;
     var height = 200;
     var xFaktor=30;
     var yFaktor=20;

var svgElement= d3.select('overviewLinechart').append(svg).attr({
   
    'width': width,
    'height': height,

});


var pfad=
    d3.svg.line()
        .x(function (d){
            return d.spieltag*xFaktor;
        })
        .y(function (d){
            return height - d.tore*yFaktor;
        });
        .interpolate('basis')

svgElement
    .append('path')
    .attr ({
        'd': pfad(daten),
        'fill': 'none',
        'stroke': 'black',
        'stroke-width': 4
         //dicke des stiftes


    });



}






