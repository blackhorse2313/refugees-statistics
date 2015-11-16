angular.module('distanceModule', [])
    .controller('distanceCtrl', ['$scope', '$http', function($scope, $http) {
        var d = [];
        var i, j;
        var scale = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];
        $http.get('data/total_applicants_each_year.json')
            .then(function(res) {
                var data = res.data.data;

                for (j = 0; j < scale.length; j++) {
                    var year = [];
                    d.push(year);
                }
                for (i = 0; i < data.length; i++) {
                    for (j = 0; j < scale.length; j++) {
                        if (data[i].year == scale[j]) {
                            var month = {
                                axis: getMonthName(data[i].month),
                                value: data[i].applicants
                            };
                            d[j].push(month);
                        }
                    }
                }
                genRadarChart(d, scale);
            });


    }]);

var genRadarChart = function(data, LegendOptions) {
    var wh = 500,
        m = 50,
        legendWidth = 100;

    var margin = {
            top: m,
            right: m + legendWidth,
            bottom: m,
            left: m
        },
        width = wh + legendWidth,
        height = wh;

        var colorscale = d3.scale.category10();

    ////////////////////////////////////////////////////////////// 
    //////////////////// Draw the Chart ////////////////////////// 
    ////////////////////////////////////////////////////////////// 

    //var color = d3.scale.ordinal()
    //	.range(["#EDC951","#CC333F","#00A0B0"]);

    var radarChartOptions = {
        w: width,
        h: height,
        margin: margin,
        maxValue: 120000,
        levels: 12,
        roundStrokes: false,
        labelFactor: 1.1,
        dotRadius: 3, 	
        //color: color
    };
    //Call function to draw the Radar chart
    RadarChart(".radarChart", data, radarChartOptions);

    var svg = d3.select('.radarChart')
        .selectAll('svg')
        .append('svg')
        .attr("width", 500)
        .attr("height", 500);

    //Create the title for the legend
    var text = svg.append("text")
        .attr("class", "title")
        .attr('transform', 'translate(90,0)')
        .attr("x", width - 70)
        .attr("y", 10)
        .attr("font-size", "12px")
        .attr("fill", "#404040")
        .text("What % of owners use a specific service in a week");

    //Initiate Legend	
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("height", 100)
        .attr("width", 200)
        .attr('transform', 'translate(90,20)');
    //Create colour squares
    legend.selectAll('rect')
        .data(LegendOptions)
        .enter()
        .append("rect")
        .attr("x", width - 65)
        .attr("y", function(d, i) {
            return i * 20;
        })
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function(d, i) {
            return colorscale(i);
        });
    //Create text next to squares
    legend.selectAll('text')
        .data(LegendOptions)
        .enter()
        .append("text")
        .attr("x", width - 52)
        .attr("y", function(d, i) {
            return i * 20 + 9;
        })
        .attr("font-size", "11px")
        .attr("fill", "#737373")
        .text(function(d) {
            return d;
        });
};
