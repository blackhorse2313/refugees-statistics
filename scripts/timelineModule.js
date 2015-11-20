angular.module('timelineModule', ['angularAwesomeSlider'])
    .controller('timelineCtrl', ['$scope', '$http', function($scope, $http) {

        var scale = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];
        var d = [];
        var i, j;
        var data;

        $scope.yearValues = [];
        for (var s = 0; s < scale.length; s++) {
            var object = {
                year: scale[s],
                applicants: 0
            };
            $scope.yearValues.push(object);
        }
        $http.get('data/total_applicants_each_year.json')
            .then(function(res) {

                data = res.data.data;
                for (i = 0; i < data.length; i++) {
                    for (j = 0; j < $scope.yearValues.length; j++) {
                        if (data[i].year == $scope.yearValues[j].year) {
                            $scope.yearValues[j].applicants += data[i].applicants;
                        }
                    }
                }

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
                $scope.changeInterval();
            });



        // $scope.rangeValue = "2011;2015";
        $scope.rangeValue = "2011;2015";
        $scope.changeInterval = function() {
            var yearData = [];
            var monthData = [];
            var lowerBound = $scope.rangeValue.split(";")[0];
            var upperBound = $scope.rangeValue.split(";")[1];

            for (i = lowerBound; i <= upperBound; i++) {
                for (j = 0; j < scale.length; j++) {
                    if ($scope.yearValues[j].year == i) {
                        yearData.push($scope.yearValues[j]);
                    }
                }
            }

            genVisYearlyLineChart(yearData);


            var s = [];
            for (i = lowerBound; i <= upperBound; i++) {
                s.push(parseInt(i));
                for (j = 0; j < data.length; j++) {
                    if (data[j].year == i) {
                        monthData.push(data[j]);
                    }
                }
            }


            genRadarChart(mapping(monthData, s), s);
            genVisMonthlyLineChart(monthData, s);
        };
        // slider options
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

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////       d3 function                   /////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////

        function genVisMonthlyLineChart(data, scale) {

            $('#lineChartMonth').remove();
            // Set the dimensions of the canvas / graph
            var margin = {
                    top: 30,
                    right: 50,
                    bottom: 30,
                    left: 50
                },
                width = 500 - margin.left - margin.right,
                height = 250 - margin.top - margin.bottom;


            var f = d3.format(",.0f");

            // Set the ranges
            var x = d3.scale.ordinal()
                .rangeBands([0, width])
                .domain(data.map(function(d) {
                    return d.year + '_' + d.month;
                }));
            var y = d3.scale.linear()
                .range([height, 0])
                .domain([0, d3.max(data, function(d) {
                    return d.applicants;
                })]);
            var xText = d3.scale.ordinal()
                .rangeBands([0, width])
                .domain(data.map(function(d) {
                    return d.year + '';
                }));

            //number of ticks
            var max = d3.max(data, function(d) {
                return d.year;
            });
            var min = d3.min(data, function(d) {
                return d.year;
            });
            // Define the axes

            var xAxis = d3.svg.axis().scale(xText)
                .ticks(max - min)
                .tickFormat(d3.format("d"))
                //.tickSize(10)      
                .orient("bottom");

            var xAxisTicks = d3.svg.axis().scale(x)
                .ticks(data.length)
                .tickFormat("")
                .orient("bottom");

            var yAxis = d3.svg.axis().scale(y)
                .orient("left").ticks(5);

            // Define the line
            var valueline = d3.svg.line()
                .x(function(d) {
                    return x(d.year + '_' + d.month);
                })
                .y(function(d) {
                    return y(d.applicants);
                });

            // Adds the svg canvas
            var svg = d3.select("#monthlyLineChart")
                .append("svg")
                .attr("id", "lineChartMonth")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

            // Scale the range of the data

            // Add the valueline path.

            svg.append("path")
                .attr("class", "line")
                .attr("d", valueline(data));


            // add value line for each year
            for (j = 0; j < scale.length; j++) {
                var yearData = [];
                for (i = 0; i < data.length; i++) {
                    if (data[i].year == scale[j]) {
                        yearData.push(data[i]);
                    }
                }
                svg.append("path")
                    .attr("class", "yearline_" + scale[j])
                    .attr("d", valueline(yearData));
            }

            ///////////////////////////////////////////////////////////////////////////////////////////////////////
            // invisible rectangles for selecting year
            var rectangle = svg.selectAll('rect')
                .data(scale)
                .enter()
                .append('g')
                .attr('class', function(d) {
                    return 'rect_' + d;
                })
                .append('rect')
                .attr('x', function(d) {
                    return xText(d + '');
                })
                .attr("y", 0 - margin.top)
                .attr("width", (width / xText.range().length))
                .attr("height", height + margin.top)
                .attr("opacity", 0)
                .on("mouseover", function(d, i) {
                    $('#yearIndex_' + i).css('fill-opacity', 0.5);
                    $('.yearline_' + d).css('stroke', 'red');
                })
                .on("mouseout", function(d, i) {
                    $('#yearIndex_' + i).css('fill-opacity', 0);
                    $('.yearline_' + d).css('stroke', '#2C3E50');
                }).on("click", function(d, i) {
                    var r = d + ";" + d;
                    console.log(r);
                    $scope.rangeValue = r;
                    // $('#range').attr("value",r);
                });

            // Add the X Axis
            svg.append("g")
                .attr("id", "monthScaleText")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxisTicks);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);

        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////




    }]);

function genVisYearlyLineChart(data) {
    $('#lineChartYear').remove();

    // Set the dimensions of the canvas / graph
    var margin = {
            top: 30,
            right: 50,
            bottom: 30,
            left: 50
        },
        width = 500 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    // Set the ranges
    var x = d3.scale.linear()
        .range([0, width]);
    var y = d3.scale.linear()
        .range([height, 0]);



    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom")
        .ticks(data.length)
        .tickFormat(d3.format("d"))
        .tickSubdivide(0);

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
    var svg = d3.select("#yearlyLineChart")
        .append("svg")
        .attr("id", "lineChartYear")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) {
        return d.year;
    }));
    y.domain([0, d3.max(data, function(d) {
        return d.applicants;
    })]);

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
        .append('g')
        .attr('class', 'dot')
        .append('circle')
        .attr("opacity", 1)
        .attr('cx', function(d) {
            return x(d.year);
        })
        .attr('r', function(d) {
            return 5;
        })
        .attr('cy', function(d) {
            return y(d.applicants);
        })
        .attr('fill', function(d) {
            return '#337AB7';
        }).on("mouseover", function(d, i) {
            $('#yearIndex_' + i).css('fill-opacity', 0.5);
        })
        .on("mouseout", function(d, i) {
            $('#yearIndex_' + i).css('fill-opacity', 0);
        });

    // invisible rectangles for selecting year
    var rectangle = svg.selectAll('g.dot')
        .append("rect")
        .data(data)
        .attr('x', function(d) {
            return x(d.year) - (width / data.length / 2);
        })
        .attr("y", 0 - margin.top)
        .attr("width", width / data.length)
        .attr("height", height + margin.top)
        .attr("opacity", 0)
        .on("mouseover", function(d, i) {
            $('#yearIndex_' + i).css('fill-opacity', 0.5);
        })
        .on("mouseout", function(d, i) {
            $('#yearIndex_' + i).css('fill-opacity', 0);
        });

    var f = d3.format(",.0f");

    svg
        .selectAll('g.dot')
        .append('text')
        .data(data)
        .text(function(d) {
            return f(d.applicants);
        })
        .attr('x', function(d) {
            return x(d.year);
        })
        .attr('y', function(d) {
            return y(d.applicants) - 8;
        })
        .attr('font-size', 300)
        .attr('font-family', 'Arial')
        .attr('fill', '#2C3E50')
        .attr('text-anchor', 'middle');
}

var genRadarChart = function(data, LegendOptions) {

    var scale = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];
    var colorscale = d3.scale.category10();

    color = d3.scale.ordinal()
        .range(colorscale.range())
        .domain(d3.range(0, 7));

    var colorStartIndex = scale.indexOf(LegendOptions[0]);

    var maxValue = 0;
    for (i = 0; i < data.length; i++) {
        var value = d3.max(data[i], function(d) {
            return d.value;
        });
        if (value > maxValue) {
            maxValue = value;
        }
    }
    maxValue = Math.ceil(maxValue / 10000) * 10000;
    console.log('maxValue: ' + maxValue);

    for (i = 0; i < data.length; i++) {
        if (data[i].length < 12) {
            var month = {
                axis: getMonthName(data[i].length),
                value: 0
            };
            data[i].push(month);
        }
    }

    $('#radarChart').remove();
    var wh = 400,
        m = 50,
        legendWidth = 100;

    var margin = {
            top: m,
            right: m + legendWidth,
            bottom: m,
            left: m
        },
        width = wh,
        height = wh;

    ////////////////////////////////////////////////////////////// 
    //////////////////// Draw the Chart ////////////////////////// 
    ////////////////////////////////////////////////////////////// 

    var radarChartOptions = {
        w: width,
        h: height,
        margin: margin,
        maxValue: maxValue,
        levels: maxValue / 10000,
        roundStrokes: false,
        labelFactor: 1.1,
        dotRadius: 3
    };
    //Call function to draw the Radar chart
    RadarChart(".radarChart", data, radarChartOptions, colorStartIndex);

    ////////////////////////////////////////////
    /////////// Initiate legend ////////////////
    ////////////////////////////////////////////

    var svg = d3.select('.radarChart')
        .selectAll('svg')
        .append('svg')
        .attr("width", wh + 300)
        .attr("height", wh + 300);

    var legendTop = 30;
    //Create the title for the legend
    var text = svg.append("text")
        .attr("class", "title")
        .attr('transform', 'translate(90,0)')
        .attr("x", wh + 20 + 15)
        .attr("y", 10 + legendTop)
        .attr("font-size", "12px")
        .attr("fill", "#404040")
        .style("font-weight", "bold")
        .text("Year");

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
        .attr("x", wh + 20)
        .attr("y", function(d, i) {
            return i * 20 + legendTop;
        })
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function(d, i) {
            return color(7 - (i + colorStartIndex));
        });
    //Create text next to squares
    legend.selectAll('text')
        .data(LegendOptions)
        .enter()
        .append("text")
        .attr("x", wh + 20 + 15)
        .attr("y", function(d, i) {
            return i * 20 + 9 + legendTop;
        })
        .attr("font-size", "11px")
        .attr("fill", "#737373")
        .text(function(d) {
            return d;
        });
};

var mapping = function(data, scale) {
    var d = [];
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
    return d;
};
