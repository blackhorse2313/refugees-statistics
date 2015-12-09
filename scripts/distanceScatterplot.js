var genDistanceScatterplot = function(dataset, map, NUM_DESTINATIONS) {

    d3.select("#distanceScatterplot").select("svg").remove();

    var width = 400,
        height = 400;
    var delimiter = d3.format(',.0f');

    var dotColor = d3.scale.category10().domain(d3.extent(dataset, function(d) {
        return d.country;
    }));

    var margins = {
        "left": 40,
        "right": 180,
        "top": 30,
        "bottom": 40
    };

    // we add the SVG component to the scatterPlotdistance div
    svg = d3.select("#distanceScatterplot").append("svg").attr("width", width).attr("height", height).append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");


    // draw axis only one time
    if (dataset.length !== 0) {
        var x = d3.scale.linear()
            .domain(d3.extent(dataset[0].values, function(d) {
                return d.distance;
            }))
            .range([0, width - margins.left - margins.right]);

        var y = d3.scale.linear()
            .domain(d3.extent(dataset[0].values, function(d) {
                return d.applicants_population;
            }))
            .range([height - margins.top - margins.bottom, 0]);
        // draw axis
        // we add the axes SVG component. At this point, this is just a placeholder. The actual axis will be added in a bit
        svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + y.range()[0] + ")");
        svg.append("g").attr("class", "y axis");
        // this is the actual definition of our x and y axes. The orientation refers to where the labels appear - for the x axis, below or above the line, and for the y axis, left or right of the line. Tick padding refers to how much space between the tick and the label. There are other parameters too - see https://github.com/mbostock/d3/wiki/SVG-Axes for more information
        var xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(0).tickFormat("");
        var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0).tickFormat("");
        // this is where we select the axis we created a few lines earlier. See how we select the axis item. in our svg we appended a g element with a x/y and axis class. To pull that back up, we do this svg select, then 'call' the appropriate axis object for rendering.    
        svg.selectAll("g.y.axis").call(yAxis);
        svg.selectAll("g.x.axis").call(xAxis);
        // this is our X axis label. Nothing too special to see here.
        svg.append("text")
            .attr("fill", "#414241")
            .attr("text-anchor", "end")
            .attr("x", width / 2 - 50)
            .attr("y", height - 50)
            .text("Distance");

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("y", -20)
            .attr("x", -200)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Asylum applicants / population");

        // real tooltip
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "Destination country: <u>" + d.destination + "</u><br>Refugees / million inhabitants: <u>" + d3.round(d.applicants_population, 3) + "</u><br>Distance: <u>" + delimiter(d.distance) + " km</u)";
            });
        svg.call(tip);


        var totalxSeries = [];
        var totalySeries = [];
        var xyTotalMap = [];

        // dots for every country
        for (var i = 0; i < dataset.length; i++) {
            var data = dataset[i].values;
            data = data.slice(0, NUM_DESTINATIONS);

            var x = d3.scale.linear()
                .domain(d3.extent(data, function(d) {
                    return d.distance;
                }))
                .range([0, width - margins.left - margins.right]);

            var y = d3.scale.linear()
                .domain(d3.extent(data, function(d) {
                    return d.applicants_population;
                }))
                .range([height - margins.top - margins.bottom, 0]);

            // now, we can get down to the data part, and drawing stuff. We are telling D3 that all nodes (g elements with class node) will have data attached to them. The 'key' we use (to let D3 know the uniqueness of items) will be the iso2.
            var node = svg.selectAll("g.node").data(data, function(d) {
                var key = d.source_iso2 + '_' + d.destination_iso2;
                return key;
            });

            // we 'enter' the data, making the SVG group (to contain a circle and text) with a class node. This corresponds with what we told the data it should be above.
            var nodeGroup = node.enter().append("g").attr("class", "node")
                // this is how we set the position of the items. Translate is an incredibly useful function for rotating and positioning items 
                .attr('transform', function(d) {
                    return "translate(" + x(d.distance) + "," + y(d.applicants_population) + ")";
                });

            // we add our first graphics element! A circle! 
            nodeGroup.append("circle")
                .attr("r", function(d) {
                    return 6;
                })
                .attr("class", "dot")
                .attr("id", function(d) {
                    return d.source_iso2 + '_' + d.destination_iso2;
                })
                .style("fill", function(d) {
                    return dotColor(d.source);
                })
                .style("opacity", 1)
                .style("cursor", "pointer")
                .on("mouseover", function(d) {
                    $("circle").css("opacity", 0.1);
                    $("circle[id^='" + d.source_iso2 + "']").css("opacity", 1);
                    $(".trendline_" + d.source_iso2).css("visibility", "visible");
                    $(".correlation_total").css("visibility", "hidden");

                    if ($(".d3-tip").css("opacity") !== 1) {
                        tip.show(d);
                    } else {
                        tip.hide(d);
                    }

                    var origin = map.computeCentroidByName(d.source);
                    map.selectCountryByName(d.destination);
                })
                .on("mouseout", function(d) {
                    tip.hide(d);
                    $("circle").css("opacity", 1);
                    $(".trendline_" + d.source_iso2).css("visibility", "hidden");
                    $(".correlation_total").css("visibility", "visible");

                    map.selectCountryByName("");
                });

            var xSeries = [];
            var ySeries = [];
            data.sort(function(a, b) {
                return a.distance - b.distance;
            });
            for (var j = 0; j < data.length; j++) {
                xSeries.push(data[j].distance);
                ySeries.push(data[j].applicants_population);

                xyTotalMap.push({
                    xvalue: x(data[j].distance),
                    yvalue: y(data[j].applicants_population)
                });
            }
            var linePoints = findLineByLeastSquares(xSeries, ySeries);


            while (linePoints[1][linePoints[1].length - 1] < 0) {
                linePoints[0].pop();
                linePoints[1].pop();
            }
            while (linePoints[1][0] < 0) {
                linePoints[0].shift();
                linePoints[1].shift();
            }

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
                .attr("id", "trendline")
                .style("visibility", "hidden")
                .attr("class", function(d) {
                    return "trendline_" + dataset[i].values[0].source_iso2;
                })
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
                .attr("stroke", function(d) {
                    return dotColor(dataset[i].values[0].source);
                })
                .attr("stroke-width", 2);

            // correlation text
            svg.append("text")
                .text("Correlation: " + d3.round(pearsonCorrel, 3))
                .attr("class", function(d) {
                    return "trendline_" + dataset[i].values[0].source_iso2;
                })
                .style("visibility", "hidden")
                .style("fill", function(d) {
                    return dotColor(dataset[i].values[0].source);
                })
                .attr("x", function(d) {
                    return x(x2) + 5;
                })
                .attr("y", function(d) {
                    return y(y2) + 3;
                });
        }
        xyTotalMap.sort(function(a, b) {
            return a.xvalue - b.xvalue;
        });
        xyTotalMap.forEach(function(entry) {
            totalxSeries.push(entry.xvalue);
            totalySeries.push(entry.yvalue);
        });

        ///////////////// Trendline for all data ////////////////////////////////////////////
        var alllinePoints = findLineByLeastSquares(totalxSeries, totalySeries);
        var totalx1 = alllinePoints[0][0];
        var totaly1 = alllinePoints[1][0];
        var totalx2 = alllinePoints[0][alllinePoints[0].length - 1];
        var totaly2 = alllinePoints[1][alllinePoints[0].length - 1];
        var totaltrendData = [
            [totalx1, totaly1, totalx2, totaly2]
        ];


        var toalttrendline = svg.selectAll(".trendline")
            .data(totaltrendData);
        toalttrendline.enter()
            .append("line")
            .attr("id", "trendline")
            .attr("class", function(d) {
                return "trendline_total";
            })
            .attr("x1", function(d) {
                return d[0];
            })
            .attr("y1", function(d) {
                return d[1];
            })
            .attr("x2", function(d) {
                return d[2];
            })
            .attr("y2", function(d) {
                return d[3];
            })
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // correlation text
        var totalpearsonCorrel = getPearsonsCorrelation(totalxSeries, totalySeries);
        svg.append("text")
            .text("Overall Correlation: " + -(d3.round(totalpearsonCorrel, 3)))
            .attr("class", "correlation_total")
            .style("fill", "black")
            .attr("x", function(d) {
                return totalx2 + 5;
            })
            .attr("y", function(d) {
                return totaly2 + 3;
            });

        // add the tooltip area to the webpage
        tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        ////////////////////////////////////////////
        /////////// Initiate legend ////////////////
        ////////////////////////////////////////////

        var svg = d3.select('#distanceScatterplot')
            .selectAll('svg')
            .append('svg')
            .attr("width", 400)
            .attr("height", 400)
            .attr("stroke", "solid black");

        //Create the title for the legend
        var legendTop = 30;
        var text = svg.append("text")
            .attr("class", "title")
            .attr('transform', 'translate(90,0)')
            .attr("x", width - 200)
            .attr("y", 10 + legendTop)
            .attr("font-size", "12px")
            .attr("fill", "#404040")
            .style("font-weight", "bold")
            .text("Countries");

        //Initiate Legend   
        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("height", 100)
            .attr("width", 200)
            .attr('transform', 'translate(90,20)');

        //Create colour squares
        legend.selectAll('rect')
            .data(dataset)
            .enter()
            .append("rect")
            .attr("x", width - 215)
            .attr("y", function(d, i) {
                return i * 20 + legendTop;
            })
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function(d, i) {
                return dotColor(d.country);
            });

        //Create text next to squares
        legend.selectAll('text')
            .data(dataset)
            .enter()
            .append("text")
            .attr("x", width - 200)
            .attr("y", function(d, i) {
                return i * 20 + 9 + legendTop;
            })
            .attr("font-size", "11px")
            .attr("fill", "#737373")
            .text(function(d) {
                return d.country;
            });

    } else {
        //ask user to select a country
    }
};
