angular.module('gdpModule', ['angularAwesomeSlider'])
    .controller('gdpCtrl', ['$scope', '$http', '$interval', function($scope, $http, $interval) {

        var scale = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];
        var i, j, k; // the iterators

        $scope.dataset = [];
        $scope.countries = [];
        $scope.currentYear = 2015;



        $scope.stats = [];
        $scope.yearValueList = [];
        for (i = 0; i < scale.length; i++) {
            var stat = {
                year: scale[i],
                lowerBound: 0,
                upperBound: 0,
                median: 0
            };
            var yearValueItem = {
                year: scale[i],
                valueList: []
            };
            $scope.stats.push(stat);
            $scope.yearValueList.push(yearValueItem);

        }

        $http.get('data/applicants_gdp.json')
            .then(function(res) {
                $scope.dataset = res.data.data;

                //generate ststistic data for outliers
                for (i = 0; i < $scope.dataset.length; i++) {
                    $scope.dataset[i].applicants_population = Math.log10($scope.dataset[i].applicants_population);
                    $scope.dataset[i].korrel = $scope.dataset[i].GDP / $scope.dataset[i].applicants_population;
                    for (j = 0; j < scale.length; j++) {
                        if ($scope.dataset[i].year == $scope.yearValueList[j].year) {
                            $scope.yearValueList[j].valueList.push($scope.dataset[i].korrel);
                        }
                    }
                }
                for (i = 0; i < scale.length; i++) {

                    var lowerQuantile = d3.quantile($scope.yearValueList[i].valueList.sort(function(a, b) {
                        return a - b;
                    }), 0.25);
                    var median = d3.quantile($scope.yearValueList[i].valueList.sort(function(a, b) {
                        return a - b;
                    }), 0.5);
                    var upperQuantile = d3.quantile($scope.yearValueList[i].valueList.sort(function(a, b) {
                        return a - b;
                    }), 0.75);
                    var iqr = (upperQuantile - lowerQuantile) * 0.45;
                    $scope.stats[i].lowerBound = lowerQuantile - iqr;
                    $scope.stats[i].upperBound = upperQuantile + iqr;
                    $scope.stats[i].median = median;
                }
                for (i = 0; i < $scope.dataset.length; i++) {
                    $scope.dataset[i].selected = true;
                    if ($scope.dataset[i].population < 1000000) {
                        $scope.dataset[i].selected = false;
                    }
                    for (j = 0; j < scale.length; j++) {
                        if ($scope.dataset[i].year == $scope.stats[j].year) {
                            //if ($scope.dataset[i].korrel <= $scope.stats[j].lowerBound || $scope.dataset[i].korrel >= $scope.stats[j].upperBound) {
                            if ($scope.dataset[i].korrel <= $scope.stats[j].median * 0.4 || $scope.dataset[i].korrel >= $scope.stats[j].median * 1.8) {
                                $scope.dataset[i].outlier = true;
                            } else {
                                $scope.dataset[i].outlier = false;
                            }
                        }
                    }
                }




                // list
                for (i = 0; i < $scope.dataset.length; i++) {
                    if ($scope.dataset[i].year == $scope.currentYear) {
                        $scope.countries.push($scope.dataset[i]);
                    }
                }
                var displayData = [];
                for (i = 0; i < $scope.dataset.length; i++) {
                    if ($scope.dataset[i].year == $scope.currentYear && $scope.dataset[i].selected) {
                        displayData.push($scope.dataset[i]);
                    }
                }

                $scope.countries.sort(function(a, b) {
                    if (a.country < b.country) return -1;
                    if (a.country > b.country) return 1;
                    return 0;
                });
                genVis(displayData);
            });

        $scope.check = function(iso) {
            var displayData = [];
            for (i = 0; i < $scope.dataset.length; i++) {
                if ($scope.dataset[i].iso2 == iso) {
                    if ($scope.dataset[i].selected) {
                        $scope.dataset[i].selected = false;
                    } else {
                        $scope.dataset[i].selected = true;
                    }
                }
                if ($scope.dataset[i].year == $scope.currentYear && $scope.dataset[i].selected) {
                    displayData.push($scope.dataset[i]);
                }

            }
            $('#scatterPlotGDP > svg').remove();
            genVis(displayData);
        };




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
        $scope.disabled = false;
        $scope.changeTime = function() {
            var displayData = [];
            for (i = 0; i < $scope.dataset.length; i++) {
                if ($scope.dataset[i].selected && $scope.dataset[i].year == $scope.currentYear) {
                    displayData.push($scope.dataset[i]);
                }
            }
            $('#scatterPlotGDP > svg').remove();
            genVis(displayData);
        };
        $scope.simulate = function() {
            var s = 0;
            $scope.disabled = true;
            $scope.currentYear = scale[s];
            $scope.changeTime();
            $interval(function() {
                s++;
                $scope.currentYear = scale[s];
                $scope.changeTime();
                if (s == scale.length - 1) {
                    $scope.disabled = false;
                }
            }, 1500, scale.length - 1);
        };


    }]);

// just to have some space around items. 
var margins = {
    "left": 40,
    "right": 80,
    "top": 30,
    "bottom": 30
};

var width = 500;
var height = 500;
var svg, tooltip;

function genVis(data) {
    // we add the SVG component to the scatterPlotGDP div
    svg = d3.select("#scatterPlotGDP").append("svg").attr("width", width).attr("height", height).append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

    var x = d3.scale.linear()
        .domain(d3.extent(data, function(d) {
            return d.GDP;
        }))
        .range([0, width - margins.left - margins.right]);

    var y = d3.scale.log()
        .domain(d3.extent(data, function(d) {
            return d.applicants_population;
        }))
        .range([height - margins.top - margins.bottom, 0]);

    // we add the axes SVG component. At this point, this is just a placeholder. The actual axis will be added in a bit
    svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + y.range()[0] + ")");
    svg.append("g").attr("class", "y axis");

    // this is our X axis label. Nothing too special to see here.
    svg.append("text")
        .attr("fill", "#414241")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", height - 35);


    // this is the actual definition of our x and y axes. The orientation refers to where the labels appear - for the x axis, below or above the line, and for the y axis, left or right of the line. Tick padding refers to how much space between the tick and the label. There are other parameters too - see https://github.com/mbostock/d3/wiki/SVG-Axes for more information
    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickPadding(2);
    var yAxis = d3.svg.axis().scale(y).orient("left").tickPadding(2);

    // this is where we select the axis we created a few lines earlier. See how we select the axis item. in our svg we appended a g element with a x/y and axis class. To pull that back up, we do this svg select, then 'call' the appropriate axis object for rendering.    
    svg.selectAll("g.y.axis").call(yAxis);
    svg.selectAll("g.x.axis").call(xAxis);

    // now, we can get down to the data part, and drawing stuff. We are telling D3 that all nodes (g elements with class node) will have data attached to them. The 'key' we use (to let D3 know the uniqueness of items) will be the iso2.
    var node = svg.selectAll("g.node").data(data, function(d) {
        return d.iso2;
    });

    // we 'enter' the data, making the SVG group (to contain a circle and text) with a class node. This corresponds with what we told the data it should be above.
    var nodeGroup = node.enter().append("g").attr("class", "node")
        // this is how we set the position of the items. Translate is an incredibly useful function for rotating and positioning items 
        .attr('transform', function(d) {
            return "translate(" + x(d.GDP) + "," + y(d.applicants_population) + ")";
        });

    // add the tooltip area to the webpage
    tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // we add our first graphics element! A circle! 
    nodeGroup.append("circle")
        .attr("r", 5)
        .attr("class", "dot")
        .style("fill", function(d) {
            if (d.outlier) {
                return 'red';
            } else {
                return '#2c3e50';
            }

        })
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(d.country)
                .style("left", (d3.event.pageX - 10) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });


    //Trentline
    var xSeries = [];
    var ySeries = [];
    data.sort(function(a, b) {
        return a.GDP - b.GDP;
    });
    for (var j = 0; j < data.length; j++) {
        if (!data[j].outlier) {
            xSeries.push(data[j].GDP);
            ySeries.push(data[j].applicants_population);
        }
    }
    var linePoints = findLineByLeastSquares(xSeries, ySeries);
    console.log(linePoints);
    var pearsonCorrel = getPearsonsCorrelation(xSeries, ySeries);

    var x1 = linePoints[0][0];
    var y1 = linePoints[1][0];
    var x2 = linePoints[0][linePoints[0].length - 1];
    var y2 = linePoints[1][linePoints[0].length - 1];
    var trendData = [
        [x1, y1, x2, y2]
    ];
    var trendline = svg.selectAll(".trendline")
        .data(trendData);
    trendline.enter()
        .append("line")
        .attr("class", "trendline")
        .attr("x1", function(d) {
            return x(d[0]);
        })
        .attr("y1", function(d) {
            return y(d[1]);
        })
        .attr("x2", function(d) {
            return x(d[2]);
        })
        .attr("y2", function(d) {
            return y(d[3]);
        })
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    svg.append("text")
        .text("Correlation: " + d3.round(pearsonCorrel, 3))
        .attr("class", "text-label")
        .style("fill", "#1A242F")
        .style("font-size", "0.8em")
        .attr("x", function(d) {
            return x(x2) - 8;
        })
        .attr("y", function(d) {
            return y(y2) + 23;
        });

}




function findLineByLeastSquares(values_x, values_y) {
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var count = 0;

    /*
     * We'll use those variables for faster read/write access.
     */
    var x = 0;
    var y = 0;
    var values_length = values_x.length;

    if (values_length != values_y.length) {
        throw new Error('The parameters values_x and values_y need to have same size!');
    }

    /*
     * Nothing to do.
     */
    if (values_length === 0) {
        return [
            [],
            []
        ];
    }

    /*
     * Calculate the sum for each of the parts necessary.
     */
    for (var v = 0; v < values_length; v++) {
        x = values_x[v];
        y = values_y[v];
        sum_x += x;
        sum_y += y;
        sum_xx += x * x;
        sum_xy += x * y;
        count++;
    }

    /*
     * Calculate m and b for the formular:
     * y = x * m + b
     */
    var m = (count * sum_xy - sum_x * sum_y) / (count * sum_xx - sum_x * sum_x);
    var b = (sum_y / count) - (m * sum_x) / count;

    /*
     * We will make the x and y result line now
     */
    var result_values_x = [];
    var result_values_y = [];

    for (var v = 0; v < values_length; v++) {
        x = values_x[v];
        y = x * m + b;
        result_values_x.push(x);
        result_values_y.push(y);
    }

    return [result_values_x, result_values_y];
}

function getPearsonsCorrelation(x, y) {
    var shortestArrayLength = 0;
    if (x.length == y.length) {
        shortestArrayLength = x.length;
    } else if (x.length > y.length) {
        shortestArrayLength = y.length;
        console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
    } else {
        shortestArrayLength = x.length;
        console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
    }

    var xy = [];
    var x2 = [];
    var y2 = [];

    for (var i = 0; i < shortestArrayLength; i++) {
        xy.push(x[i] * y[i]);
        x2.push(x[i] * x[i]);
        y2.push(y[i] * y[i]);
    }

    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_x2 = 0;
    var sum_y2 = 0;

    for (var i = 0; i < shortestArrayLength; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += xy[i];
        sum_x2 += x2[i];
        sum_y2 += y2[i];
    }

    var step1 = (shortestArrayLength * sum_xy) - (sum_x * sum_y);
    var step2 = (shortestArrayLength * sum_x2) - (sum_x * sum_x);
    var step3 = (shortestArrayLength * sum_y2) - (sum_y * sum_y);
    var step4 = Math.sqrt(step2 * step3);
    var answer = step1 / step4;

    if (isNaN(answer)) return 0;
    return answer;
}
