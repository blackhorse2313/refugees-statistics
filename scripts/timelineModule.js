angular.module('timelineModule', ['angularAwesomeSlider'])
    .controller('timelineCtrl', ['$scope', '$http', function($scope, $http) {

        var i,j;
        var d = [];

        $scope.yearValues = [];
        var scale = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];
        for (var s = 0; s < scale.length; s++) {
            var object = {
                year: scale[s],
                applicants: 0
            };
            $scope.yearValues.push(object);
        }
        $http.get('data/total_applicants_each_year.json')
            .then(function(res) {
                var data = res.data.data;
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < $scope.yearValues.length; j++) {
                        if (data[i].year == $scope.yearValues[j].year) {
                            $scope.yearValues[j].applicants += data[i].applicants;
                        }
                    }
                }
                genVisYearTimeline($scope.yearValues);

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

        
    }]);

function genVisYearTimeline(data) {

    // Set the dimensions of the canvas / graph
    var margin = {
            top: 30,
            right: 20,
            bottom: 30,
            left: 50
        },
        width = 500 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

     //Console.log(data);

    // Set the ranges
    var x = d3.scale.linear()
        .range([0, width]);
    var y = d3.scale.linear()
        .range([height, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(5);

    // Define the line
    var valueline = d3.svg.line()
        .x(function(d) {
            return x(d.year);
        })
        .y(function(d) {
            return y(d.applicants);
        });

    // Adds the svg canvas
    var svg = d3.select("#overviewLinechart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) {
        return d.year;
    }));
    y.domain(d3.extent(data, function(d) {
        return d.applicants;
    }));

    // Add the valueline path.
    svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(data));

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    //Add the Y Axis


 svg
    .selectAll('circle')
    .data(data)
    .enter()
    .append ('circle')
    .attr('cx', function (d){
      return x (d.year);
    })
    .attr('r', function (d){
            return 3;
    })
    .attr('cy', function (d){
     return y (d.applicants) ;
    })
    .attr('fill', function (d){
        return  'blue';
    });
 
    svg
        .selectAll('text')
        .data(data)
        .enter()
        .append("text")
        .text("Applicants: " + d.applicants)
        .attr("class", "text-label")
        .style("fill", "#1A242F")
        .style("font-size", "20")
        .attr("x", function(d) {
            return x (d.year) ;
        })
        .attr("y", function(d) {
            return y (d.applicants);
        });

   
 svg
   .selectAll('text')
   .data(data)  
   .enter()         
   .append('text')
   .attr('x', function (d){
      return x(d.year);
    })

    .attr('y', function (d){
     return y(d.applicants);
    })

    .attr('fill', function (d){
        return  'blue';
    })

    .attr('font-family', function (d){
        return  'Arial';
    })

    .attr('font-size', function (d){
        return  '10';
    })

   .text(function(d) {return d.applicants;
   });}

 //   svg
   //.append('circle')
  // .data(data)
  // .attr('x', function (d){
     //   return d.year;
   //})
   //.attr('y', function (d){
 //       return d.applicants;
 //  })
  // .attr('r': 5)
//});
 
     //'r': 5,
  //   'cx': 20,
     //'cy': 20,
   // 'fill': 'black'
 // });


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
    //  .range(["#EDC951","#CC333F","#00A0B0"]);

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

        


