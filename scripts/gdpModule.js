angular.module('gdpModule', ['angularAwesomeSlider'])
    .controller('gdpCtrl', ['$scope', '$http', '$interval', function($scope, $http, $interval) {

        $scope.dataset = [];
        $scope.countries = [];
        $scope.currentYear = 2015;

        $http.get('data/applicants_gdp.json')
            .then(function(res) {
                $scope.dataset = res.data.data;



                for (var i = 0; i < $scope.dataset.length; i++) {
                    $scope.dataset[i].selected = false;
                    if ($scope.dataset[i].population > 1000000) {
                        $scope.dataset[i].selected = true;
                    }
                    if ($scope.dataset[i].year == $scope.currentYear) {
                        $scope.countries.push($scope.dataset[i]);
                    }
                }
                var displayData = [];
                for (var j = 0; j < $scope.dataset.length; j++) {
                    if ($scope.dataset[j].year == $scope.currentYear && $scope.dataset[j].selected) {
                        displayData.push($scope.dataset[j]);
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
            for (var j = 0; j < $scope.dataset.length; j++) {
                if ($scope.dataset[j].iso2 == iso) {
                    if ($scope.dataset[j].selected) {
                        $scope.dataset[j].selected = false;
                    } else {
                        $scope.dataset[j].selected = true;
                    }
                }
                if ($scope.dataset[j].year == $scope.currentYear && $scope.dataset[j].selected) {
                    displayData.push($scope.dataset[j]);
                }

            }
            $('#scatterPlotGDP > svg').remove();
            genVis(displayData);
        };


        var scale = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];
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
            for (var j = 0; j < $scope.dataset.length; j++) {
                if ($scope.dataset[j].selected && $scope.dataset[j].year == $scope.currentYear) {
                    displayData.push($scope.dataset[j]);
                }
            }
            //$('#scatterPlotGDP > svg').remove();
            updateVis(displayData);
        };
        $scope.simulate = function() {
            var i = 0;
            $scope.disabled = true;
            $scope.currentYear = scale[i];
            $scope.changeTime();
            $interval(function() {
                i++;
                $scope.currentYear = scale[i];
                $scope.changeTime();
                if (i == scale.length - 1) {
                    $scope.disabled = false;
                }
            }, 1500, scale.length - 1);
        };


    }]);

// just to have some space around items. 
var margins = {
    "left": 40,
    "right": 30,
    "top": 30,
    "bottom": 30
};

var width = 500;
var height = 500;
var svg, tooltip;

function genVis(data) {


    // this will be our colour scale. An Ordinal scale.
    var colors = d3.scale.category10();

    // we add the SVG component to the scatterPlotGDP div
    svg = d3.select("#scatterPlotGDP").append("svg").attr("width", width).attr("height", height).append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

    // this sets the scale that we're using for the X axis. 
    // the domain define the min and max variables to show. In this case, it's the min and max prices of items.
    // this is made a compact piece of code due to d3.extent which gives back the max and min of the price variable within the dataset
    var x = d3.scale.linear()
        .domain(d3.extent(data, function(d) {
            return d.GDP;
        }))
        // the range maps the domain to values from 0 to the width minus the left and right margins (used to space out the visualization)
        .range([0, width - margins.left - margins.right]);

    // this does the same as for the y axis but maps from the rating variable to the height to 0. 
    var y = d3.scale.log()
        .domain(d3.extent(data, function(d) {
            return d.applicants_population;
        }))
        // Note that height goes first due to the weird SVG coordinate system
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

    // now, we can get down to the data part, and drawing stuff. We are telling D3 that all nodes (g elements with class node) will have data attached to them. The 'key' we use (to let D3 know the uniqueness of items) will be the name. Not usually a great key, but fine for this example.
    var node = svg.selectAll("g.node").data(data, function(d) {
        return d.country;
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
            // remember the ordinal scales? We use the colors scale to get a colour for our manufacturer. Now each node will be coloured
            // by who makes the node. 
            // return colors(d.manufacturer);
            return '#2c3e50';
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
}

var updateVis = function(data) {
    console.log(data);
    var x = d3.scale.linear()
        .domain(d3.extent(data, function(d) {
            return d.GDP;
        }))
        // the range maps the domain to values from 0 to the width minus the left and right margins (used to space out the visualization)
        .range([0, width - margins.left - margins.right]);

    // this does the same as for the y axis but maps from the rating variable to the height to 0. 
    var y = d3.scale.log()
        .domain(d3.extent(data, function(d) {
            return d.applicants_population;
        }))
        // Note that height goes first due to the weird SVG coordinate system
        .range([height - margins.top - margins.bottom, 0]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickPadding(2);
    var yAxis = d3.svg.axis().scale(y).orient("left").tickPadding(2);

    svg.selectAll("g.y.axis").transition().duration(1000).call(yAxis);
    svg.selectAll("g.x.axis").transition().duration(1000).call(xAxis);

    var node = svg.selectAll("g.node").data(data, function(d) {
        return d.country;
    });

    var nodeEnter = node.enter().append("g").attr("class", "node")
        .attr('transform', function(d) {
            return "translate(" + x(d.GDP) + "," + (height + 100) + ")";
        });

    nodeEnter.append("circle")
        .attr("r", 5)
        .attr("class", "dot")
        .style("fill", function(d) {
            return '#2c3e50';
        }).on("mouseover", function(d) {
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

    node.transition().duration(500)
        .attr('transform', function(d) {
            return "translate(" + x(d.GDP) + "," + y(d.applicants_population) + ")";
        });


    var nodeExit = node.exit().remove();
    nodeExit.selectAll('circle')
        .attr('r', 0);
};
