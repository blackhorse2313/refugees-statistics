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

                $scope.colors = d3.scale.linear()
                    .domain(d3.extent($scope.dataset, function(d) {
                        return d.population;
                    }))
                    .range(["white", "#217DBB"]);

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
                            if ($scope.dataset[i].korrel <= $scope.stats[j].median * 0.4 || $scope.dataset[i].korrel >= $scope.stats[j].median * 1.6) {
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
                genScatterPlotGDP(displayData, $scope.hideOutliers);
                genDotPlot(displayData);
            });

        $scope.hoverListItem = function(iso, enter) {
            for (i = 0; i < $scope.dataset.length; i++) {
                if ($scope.dataset[i].year == $scope.currentYear && $scope.dataset[i].iso2 == iso) {
                    if (enter) {
                        $("#dot" + iso).css("fill", "#2C3E50");
                        $("#hl" + iso).css("opacity", 0.1);
                    } else {
                        $("#hl" + iso).css("opacity", 0);
                        if (!$scope.dataset[i].outlier) {
                            $("#dot" + iso).css("fill", "#15A589");
                        } else {
                            $("#dot" + iso).css("fill", "#d62c1a");
                        }

                    }
                }
            }

        };

        $scope.selectAllButton = false;
        $scope.selectAll = function(selected) {
            if (selected) {
                var displayData = [];
                for (i = 0; i < $scope.dataset.length; i++) {
                    $scope.dataset[i].selected = true;
                    if ($scope.dataset[i].year == $scope.currentYear && $scope.dataset[i].selected) {
                        displayData.push($scope.dataset[i]);
                    }
                }

                genScatterPlotGDP(displayData, $scope.hideOutliers);
                genDotPlot(displayData);
            }
        };

        $scope.check = function(iso) {
            $scope.selectAllButton = false;
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
            genScatterPlotGDP(displayData, $scope.hideOutliers);
            genDotPlot(displayData);
        };

        // Button for outliers
        $scope.buttonClass = "btn btn-danger";
        $scope.buttonText = "Hide outliers";
        $scope.hideOutliers = false;
        $scope.outliersButton = function() {
            if ($scope.buttonText == "Hide outliers") {
                $scope.buttonClass = "btn btn-primary";
                $scope.buttonText = "Display outliers";
                $scope.hideOutliers = true;
            } else {
                $scope.buttonClass = "btn btn-danger";
                $scope.buttonText = "Hide outliers";
                $scope.hideOutliers = false;
            }
            var displayData = [];
            for (i = 0; i < $scope.dataset.length; i++) {
                if ($scope.dataset[i].year == $scope.currentYear && $scope.dataset[i].selected) {
                    displayData.push($scope.dataset[i]);
                }

            }
            updateScatterplot(displayData, $scope.hideOutliers);
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
            updateScatterplot(displayData, $scope.hideOutliers);


            updateDotPlot(displayData);
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
            }, 2500, scale.length - 1);
        };
    }]);

// just to have some space around items. 
var delimiter = d3.format(",.0f");
var width = 400;
var height = 430;
var svg, tip;

function genScatterPlotGDP(dataset, hideOutliers) {

    $('#scatterPlotGDP > svg').remove();
    var data = [];
    var outliers = [];
    if (hideOutliers) {
        for (i = 0; i < dataset.length; i++) {
            if (!dataset[i].outlier) {
                data.push(dataset[i]);
            } else {
                outliers.push(dataset[i]);
            }
        }
    } else {
        data = dataset;
    }

    var margins = {
        "left": 40,
        "right": 85,
        "top": 30,
        "bottom": 40
    };
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

    var dotSize = d3.scale.linear()
        .domain(d3.extent(data, function(d) {
            return d.population;
        }))
        .range([3, 15]);

    // we add the axes SVG component. At this point, this is just a placeholder. The actual axis will be added in a bit
    svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + y.range()[0] + ")");
    svg.append("g").attr("class", "y axis");


    // this is our X axis label. Nothing too special to see here.
    svg.append("text")
        .attr("fill", "#414241")
        .attr("text-anchor", "end")
        .attr("x", width / 2 - 50)
        .attr("y", height - 55)
        .text("GDP per capita");

    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("y", -15)
        .attr("x", -200)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Asylum applicants / population");

    // this is the actual definition of our x and y axes. The orientation refers to where the labels appear - for the x axis, below or above the line, and for the y axis, left or right of the line. Tick padding refers to how much space between the tick and the label. There are other parameters too - see https://github.com/mbostock/d3/wiki/SVG-Axes for more information
    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickPadding(2).tickSize(0).tickFormat("");
    var yAxis = d3.svg.axis().scale(y).orient("left").tickPadding(2).tickSize(0).tickFormat("");

    // this is where we select the axis we created a few lines earlier. See how we select the axis item. in our svg we appended a g element with a x/y and axis class. To pull that back up, we do this svg select, then 'call' the appropriate axis object for rendering.    
    svg.selectAll("g.y.axis").call(yAxis);
    svg.selectAll("g.x.axis").call(xAxis);

    // real tooltip
    tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0, 10])
        .direction('e')
        .html(function(d) {
            return '<u>' + d.country + '</u><br>GDP per capita: ' + delimiter(d.GDP) + ' $<br>Asylum applicants: ' + delimiter(d.applicants) + '<br>Population: ' + delimiter(d.population);
        });
    svg.call(tip);

    ////////////////////////// create nodes /////////////////////////////////////////////
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

    // we add our first graphics element! A circle! 
    nodeGroup.append("circle")
        .attr("r", function(d) {
            return dotSize(d.population);
        })
        .attr("class", "dot scatterplot-dot")
        .attr("id", function(d) {
            return "dot" + d.iso2;
        })
        .style("fill", function(d) {
            if (d.outlier) {
                return '#d62c1a';
            } else {
                return '#15A589';
            }

        })
        .style("opacity", 1)
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

    ////////////////////////// create invisible outliers nodes /////////////////////////////////////////////
    // now, we can get down to the data part, and drawing stuff. We are telling D3 that all nodes (g elements with class node) will have data attached to them. The 'key' we use (to let D3 know the uniqueness of items) will be the iso2.
    node = svg.selectAll("g.node").data(outliers, function(d) {
        return d.iso2;
    });

    // we 'enter' the data, making the SVG group (to contain a circle and text) with a class node. This corresponds with what we told the data it should be above.
    nodeGroup = node.enter().append("g").attr("class", "node")
        // this is how we set the position of the items. Translate is an incredibly useful function for rotating and positioning items 
        .attr('transform', function(d) {
            return "translate(" + 0 + "," + 0 + ")";
        });

    // we add our first graphics element! A circle! 
    nodeGroup.append("circle")
        .attr("r", function(d) {
            return dotSize(d.population);
        })
        .attr("class", "dot scatterplot-dot")
        .attr("id", function(d) {
            return "dot" + d.iso2;
        })
        .style("fill", function(d) {
            if (d.outlier) {
                return '#d62c1a';
            } else {
                return '#15A589';
            }

        })
        .style("opacity", 1)
        .attr("visibility", "hidden")
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);
    //////////////////////////////////////////////////////////////////////////////////////////////////////

    //Trendline
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
        .style("fill", "black")
        .attr("x", function(d) {
            return x(x2) - 8;
        })
        .attr("y", function(d) {
            return y(y2) + 23;
        });
}



var genDotPlot = function(dataset) {

    $('#dotPlotGDP > svg').remove();
    var data = [];
    var outliers = [];
    for (i = 0; i < dataset.length; i++) {
        if (!dataset[i].outlier) {
            data.push(dataset[i]);
        } else {
            outliers.push(dataset[i]);
        }
    }


    data.sort(function(a, b) {
        return a.GDP - b.GDP;
    });

    var margins = {
        "left": 100,
        "right": 20,
        "top": 20,
        "bottom": 60
    };

    var dotPadding = 10;


    svg = d3.select("#dotPlotGDP").append("svg").attr("width", width).attr("height", height).append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

    var x = d3.scale.linear()
        .domain(d3.extent(data, function(d) {
            return d.GDP;
        }))
        .range([dotPadding, width - margins.left - margins.right - dotPadding]);

    var x2 = d3.scale.linear()
        .domain(d3.extent(data, function(d) {
            return Math.log10(d.applicants_population);
        }))
        .range([dotPadding, width - margins.left - margins.right - dotPadding]);

    var y = d3.scale.ordinal()
        .domain(data.map(function(d) {
            return d.country;
        }))
        .rangeBands([height - margins.top - margins.bottom, 0])
        .rangePoints([height - margins.top - margins.bottom, 0]);

    // we add the axes SVG component. At this point, this is just a placeholder. The actual axis will be added in a bit
    svg.append("g").attr("class", "y axis");

    // this is the actual definition of our x and y axes. The orientation refers to where the labels appear - for the x axis, below or above the line, and for the y axis, left or right of the line. Tick padding refers to how much space between the tick and the label. There are other parameters too - see https://github.com/mbostock/d3/wiki/SVG-Axes for more information
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(data.length);

    // this is where we select the axis we created a few lines earlier. See how we select the axis item. in our svg we appended a g element with a x/y and axis class. To pull that back up, we do this svg select, then 'call' the appropriate axis object for rendering.    
    svg.selectAll("g.y.axis").call(yAxis);

    // svg.selectAll("g.text").style("text-anchor", "inherit");

    // now, we can get down to the data part, and drawing stuff. We are telling D3 that all nodes (g elements with class node) will have data attached to them. The 'key' we use (to let D3 know the uniqueness of items) will be the iso2.



    //////////////////////////////////////////////// horizontal lines /////////////////////////////////////////////////////////////////////////
    var arr = [];
    for (i = 0; i < data.length; i++) {
        arr.push(data[i].GDP);
    }
    var trendline = svg.selectAll(".trendline")
        .data(data);
    // Line for the dots
    trendline.enter()
        .append("line")
        .attr("class", "horizontalLine")
        .attr("id", function(d) {
            return "line" + d.iso2;
        })
        .attr("x1", function(d) {
            return x(d3.min(arr)) - dotPadding;
        })
        .attr("y1", function(d) {
            return y(d.country);
        })
        .attr("x2", function(d) {
            return x(d3.max(arr)) + dotPadding;
        })
        .attr("y2", function(d) {
            return y(d.country);
        })
        .attr("stroke", "grey")
        .attr("stroke-width", 1)
        .style("opacity", 0.5);


    //////////////////////////////////////////////// invisible lines for outliers /////////////////////////////////////////////////////////////////////////


    var trendlineOutliers = svg.selectAll(".trendline")
        .data(outliers);
    // Line for the dots
    trendlineOutliers.enter()
        .append("line")
        .attr("class", "horizontalLine")
        .attr("id", function(d) {
            return "line" + d.iso2;
        })
        .attr("x1", function(d) {
            return x(d3.min(arr)) - dotPadding;
        })
        .attr("y1", function(d) {
            return y(d.country);
        })
        .attr("x2", function(d) {
            return x(d3.max(arr)) + dotPadding;
        })
        .attr("y2", function(d) {
            return y(d.country);
        })
        .attr("stroke", "grey")
        .attr("stroke-width", 1)
        .attr("visibility", "hidden")
        .style("opacity", 0.5);


    //////////////////////////////////////////////// nodes /////////////////////////////////////////////////////////////////////////

    var node = svg.selectAll("g.gdp-node").data(data, function(d) {
        return d.country;
    });

    var node2 = svg.selectAll("g.applicants-node").data(data, function(d) {
        return d.iso2;
    });
    var nodeGroup2 = node2.enter().append("g").attr("class", "applicants-node")
        // this is how we set the position of the items. Translate is an incredibly useful function for rotating and positioning items 
        .attr('transform', function(d) {
            return "translate(" + x2(Math.log10(d.applicants_population)) + "," + y(d.country) + ")";
        });
    var nodeGroup = node.enter().append("g").attr("class", "gdp-node")
        // this is how we set the position of the items. Translate is an incredibly useful function for rotating and positioning items 
        .attr('transform', function(d) {
            return "translate(" + x(d.GDP) + "," + y(d.country) + ")";
        });

    nodeGroup2.append("circle")
        .attr("r", 5)
        .attr("class", "dot applicants-dot")
        .attr("id", function(d) {
            return "apllicantsDot" + d.iso2;
        })
        .style("opacity", 1)
        .style("fill", "#2C3E50");

    nodeGroup.append("circle")
        .attr("r", 5)
        .attr("id", function(d) {
            return "gdpDot" + d.iso2;
        })
        .attr("class", "dot gdp-dot")
        .style("opacity", 0.5)
        .style("fill", "#FF00FF");

    //////////////////////////////////////////////// invisible outliers /////////////////////////////////////////////////////////////////////////

    node = svg.selectAll("g.gdp-node").data(outliers, function(d) {
        return d.country;
    });

    node2 = svg.selectAll("g.applicants-node").data(outliers, function(d) {
        return d.iso2;
    });
    nodeGroup2 = node2.enter().append("g").attr("class", "applicants-node")
        // this is how we set the position of the items. Translate is an incredibly useful function for rotating and positioning items 
        .attr('transform', function(d) {
            return "translate(" + 0 + "," + 0 + ")";
        });
    nodeGroup = node.enter().append("g").attr("class", "gdp-node")
        // this is how we set the position of the items. Translate is an incredibly useful function for rotating and positioning items 
        .attr('transform', function(d) {
            return "translate(" + 0 + "," + 0 + ")";
        });

    nodeGroup2.append("circle")
        .attr("r", 5)
        .attr("class", "dot applicants-dot")
        .attr("id", function(d) {
            return "apllicantsDot" + d.iso2;
        })
        .style("opacity", 1)
        .style("fill", "#2C3E50")
        .attr("visibility", "hidden");

    nodeGroup.append("circle")
        .attr("r", 5)
        .attr("id", function(d) {
            return "gdpDot" + d.iso2;
        })
        .attr("class", "dot gdp-dot")
        .style("opacity", 0.5)
        .style("fill", "#FF00FF")
        .attr("visibility", "hidden");

    //////////////////////////////////////////////// invisible line for selecting/////////////////////////////////////////////////////////////////////////
    // trendline.enter()
    //     .append("line")
    //     .attr("class", "helpLine")
    //     .attr("id", function(d) {
    //         return 'hl' + d.iso2;
    //     })
    //     .attr("x1", function(d) {
    //         return x(d3.min(arr)) - dotPadding;
    //     })
    //     .attr("y1", function(d) {
    //         return y(d.country);
    //     })
    //     .attr("x2", function(d) {
    //         return x(d3.max(arr)) + dotPadding;
    //     })
    //     .attr("y2", function(d) {
    //         return y(d.country);
    //     })
    //     .attr("stroke", "red")
    //     .attr("stroke-width", 18)
    //     .style("opacity", 0)
    //     .on("mouseover", function(d) {
    //         $("#dot" + d.iso2).css("fill", "#2C3E50");
    //     })
    //     .on("mouseout", function(d) {
    //         $("#dot" + d.iso2).css("fill", "#15A589");
    //     });


    ///////////////////////////////Draw the legend ////////////////////////////////////////////
    var top = height - margins.top - margins.bottom * 0.5+10;
    var middle = 0;
    var legend = svg.append("g")
        .attr("class", "legend")
        .style("border", "1px dashed black");
    legend.append("circle")
        .attr("cx", middle)
        .attr("cy", top)
        .attr("r", 7)
        .attr("fill", "rgba(255, 0, 255, 0.5)");
    legend.append("text")
        .attr("x", middle + 10)
        .attr("y", top + 4.5)
        .text("GDP per capita");
    legend.append("circle")
        .attr("cx", middle + 100)
        .attr("cy", top)
        .attr("r", 7)
        .attr("fill", "rgb(44, 62, 80)");
    legend.append("text")
        .attr("x", middle + 110)
        .attr("y", top + 4.5)
        .text("Asylum applicants / population");
    legend.append("rect")
        .attr("x", middle - 20)
        .attr("y", top - 17)
        .attr("width", 300)
        .attr("height", 34)
        .style("fill", "none")
        .style("stroke", "grey")
        .style("stroke-width", "1")
        .style("padding", "10")
        .text("Asylum applicants / population");
};


var updateScatterplot = function(dataset, hideOutliers) {

    var data = [];
    if (hideOutliers) {
        for (i = 0; i < dataset.length; i++) {
            if (!dataset[i].outlier) {
                data.push(dataset[i]);
            }
        }
    } else {
        data = dataset;
    }

    var margins = {
        "left": 40,
        "right": 85,
        "top": 30,
        "bottom": 40
    };

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

    var dotSize = d3.scale.linear()
        .domain(d3.extent(data, function(d) {
            return d.population;
        }))
        .range([3, 15]);

    svg = d3.select("#scatterPlotGDP");

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


    node.transition().duration(2000)
        .attr('transform', function(d) {
            return "translate(" + x(d.GDP) + "," + y(d.applicants_population) + ")";
        }).each("end", function() { // End animation
            data.forEach(function(entry) {
                if (entry.outlier) {
                    $("#dot" + entry.iso2).css('fill', '#d62c1a');
                } else {
                    $("#dot" + entry.iso2).css('fill', '#15A589');
                }
            });
            showRightSP();
        }).each("start", function() { // Start animation
            hideWrongSP();
        });




    var dotIDs = [];
    data.forEach(function(entry) {
        dotIDs.push("dot" + entry.iso2);
    });

    var hideWrongSP = function() {
        var dots = $(".scatterplot-dot");
        for (i = 0; i < dots.length; i++) {
            if (dotIDs.indexOf(dots[i].id) == -1) {
                $("#" + dots[i].id).attr("visibility", "hidden");
            }
        }
    };
    var showRightSP = function() {
        var dots = $(".scatterplot-dot");
        for (i = 0; i < dots.length; i++) {
            if (dotIDs.indexOf(dots[i].id) != -1) {
                $("#" + dots[i].id).attr("visibility", "visible");
            }
        }
    };




    ///////////////////////////////////// trendline ////////////////////////////////////////////////////////////////
    //Trendline
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
    trendline.transition().duration(2000)
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

    svg.selectAll(".text-label")
        .transition().duration(2000)
        .text("Correlation: " + d3.round(pearsonCorrel, 3))
        .style("fill", "black")
        .attr("x", function(d) {
            return x(x2) - 8;
        })
        .attr("y", function(d) {
            return y(y2) + 23;
        });
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
};

var updateDotPlot = function(dataset) {

    var data = [];
    for (i = 0; i < dataset.length; i++) {
        if (!dataset[i].outlier) {
            data.push(dataset[i]);
        }
    }

    data.sort(function(a, b) {
        return a.GDP - b.GDP;
    });

    var margins = {
        "left": 100,
        "right": 20,
        "top": 20,
        "bottom": 60
    };

    var dotPadding = 10;


    svg = d3.select("#dotPlotGDP");

    var x = d3.scale.linear()
        .domain(d3.extent(data, function(d) {
            return d.GDP;
        }))
        .range([dotPadding, width - margins.left - margins.right - dotPadding]);

    var x2 = d3.scale.linear()
        .domain(d3.extent(data, function(d) {
            return Math.log10(d.applicants_population);
        }))
        .range([dotPadding, width - margins.left - margins.right - dotPadding]);

    var y = d3.scale.ordinal()
        .domain(data.map(function(d) {
            return d.country;
        }))
        .rangeBands([height - margins.top - margins.bottom, 0])
        .rangePoints([height - margins.top - margins.bottom, 0]);

    // this is the actual definition of our x and y axes. The orientation refers to where the labels appear - for the x axis, below or above the line, and for the y axis, left or right of the line. Tick padding refers to how much space between the tick and the label. There are other parameters too - see https://github.com/mbostock/d3/wiki/SVG-Axes for more information
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(data.length);

    // this is where we select the axis we created a few lines earlier. See how we select the axis item. in our svg we appended a g element with a x/y and axis class. To pull that back up, we do this svg select, then 'call' the appropriate axis object for rendering.    
    svg.selectAll("g.y.axis").transition().duration(2000).call(yAxis);

    var arr = [];
    for (i = 0; i < data.length; i++) {
        arr.push(data[i].GDP);
    }

    var trendline = svg.selectAll(".horizontalLine")
        .data(data, function(d) {
            return d.iso3;
        });
    // Line for the dots
    trendline
        .transition().duration(2000)
        .attr("y1", function(d) {
            return y(d.country);
        })
        .attr("y2", function(d) {
            return y(d.country);
        });



    // now, we can get down to the data part, and drawing stuff. We are telling D3 that all nodes (g elements with class node) will have data attached to them. The 'key' we use (to let D3 know the uniqueness of items) will be the iso2.
    var node = svg.selectAll("g.gdp-node").data(data, function(d) {
        return d.country;
    });

    var node2 = svg.selectAll("g.applicants-node").data(data, function(d) {
        return d.iso2;
    });

    var nodeGroup2 = node2.transition().duration(2000).attr("class", "applicants-node")
        // this is how we set the position of the items. Translate is an incredibly useful function for rotating and positioning items 
        .attr('transform', function(d) {
            return "translate(" + x2(Math.log10(d.applicants_population)) + "," + y(d.country) + ")";
        });
    var nodeGroup = node.transition().duration(2000).attr("class", "gdp-node")
        // this is how we set the position of the items. Translate is an incredibly useful function for rotating and positioning items 
        .attr('transform', function(d) {
            return "translate(" + x(d.GDP) + "," + y(d.country) + ")";
        }).each("end", function() { // End animation
            showRightDotplot();
        }).each("start", function() { // End animation
            hideWrongDotplot();
        });


    var dotIDs = [];
    data.forEach(function(entry) {
        dotIDs.push("gdpDot" + entry.iso2);
        dotIDs.push("apllicantsDot" + entry.iso2);
        dotIDs.push("line" + entry.iso2);
    });
    var hideWrongDotplot = function() {
        var dots = $(".gdp-dot, .applicants-dot");
        var lines = $(".horizontalLine");
        for (i = 0; i < dots.length; i++) {
            if (dotIDs.indexOf(dots[i].id) == -1) {
                $("#" + dots[i].id).attr("visibility", "hidden");
            }
        }
        for (i = 0; i < lines.length; i++) {
            if (dotIDs.indexOf(lines[i].id) == -1) {
                $("#" + lines[i].id).attr("visibility", "hidden");
            }
        }
    };
    var showRightDotplot = function() {
        var dots = $(".gdp-dot, .applicants-dot");
        var lines = $(".horizontalLine");
        for (i = 0; i < dots.length; i++) {
            if (dotIDs.indexOf(dots[i].id) != -1) {
                $("#" + dots[i].id).attr("visibility", "visible");
            }
        }
        for (i = 0; i < lines.length; i++) {
            if (dotIDs.indexOf(lines[i].id) != -1) {
                $("#" + lines[i].id).attr("visibility", "visible");
            }
        }
    };
};
