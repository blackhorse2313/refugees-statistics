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

    for (i = 0; i < shortestArrayLength; i++) {
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

var getMonthName = function(number) {
    switch (number) {
        case 1:
            return "January";
        case 2:
            return "Febuary";
        case 3:
            return "March";
        case 4:
            return "April";
        case 5:
            return "May";
        case 6:
            return "June";
        case 7:
            return "July";
        case 8:
            return "August";
        case 9:
            return "September";
        case 10:
            return "October";
        case 11:
            return "November";
        case 12:
            return "December";
        default:
            return null;
    }
};

////
//// Map
////

var WorldType = {
  EQUIDISTANT: 1,
  EQUIRECTANGULAR: 2,
  EUROPE: 3,
};

function genWorld(worldType, world, names) {
    ////
    //// Projection
    ////

    var width, height,
        projection,
        rotatable, // Rotates map on country selection
        attribute; // Page attribute to append map
    
    // Task 4
    console.log(worldType);
    if (worldType == WorldType.EQUIDISTANT) {
        width = 600, height = 600;
        rotatable = true;
        attribute = "#world-equidistant";
        projection = d3.geo.azimuthalEquidistant()
            .scale(100)
            .translate([width / 2, height / 2])
            .clipAngle(180 - 1e-3)
            .precision(.1);

    // Task 1
    } else if (worldType == WorldType.EQUIRECTANGULAR) {
        width = 800, height = 400;
        rotatable = false;
        attribute = "#world-equirectangular";
        projection = d3.geo.equirectangular()
            .scale(130)
            .translate([width / 2, height / 2])
            .precision(.1);
    } else if (worldType == WorldType.EUROPE) {
        width = 600, height = 600;
        rotatable = false;
        attribute = "#europe";
	    projection = d3.geo.equirectangular()
	        .scale(800)
	        .translate([width/2, height/2])
	        .rotate([-8, -50])
            .precision(.1);
    } else {
        console.log("@genWorld: Invalid WorldType");
    }

    var svg = d3.select(attribute).append("svg")
        .attr("width", width)
        .attr("height", height);

    var path = d3.geo.path().projection(projection);

    ////
    //// Globe lines (graticule)
    ////

    svg.append("defs").append("path")
        .datum({type: "Sphere"})
        .attr("id", "sphere")
        .attr("d", path);

    svg.append("use")
        .attr("class", "stroke")
        .attr("xlink:href", "#sphere");

    svg.append("use")
        .attr("class", "fill")
        .attr("xlink:href", "#sphere");

    var graticule = d3.geo.graticule();
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);

    d3.select(self.frameElement).style("height", height + "px");

    ////
    //// Countries
    ////

    // Assign country names
    var countries = topojson.feature(world, world.objects.countries).features;
    countries.forEach(function(d) { 
        var tryit = names.filter(function(n) { return d.id == n.id; })[0];
        if (typeof tryit === "undefined"){
          d.name = "Undefined";
        } else {
          d.name = tryit.name; 
        }
    });

    // Displays country name on the map
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");
    
    // Assign country data, with key = id
    var country = svg.selectAll(".country").data(countries, function(d) {
        return d.id;
    });
    country
        .enter()
        .insert("path")
        .attr("d", path)
        .attr("class", "land")

        // Rotate globe to center on selected country
        .on("click", function(d,i) {
            var p = d3.geo.centroid(countries[i]);

            // Depending on the map usage, we may want to rotate on selection
            if (rotatable) {
                (function transition() {
                    d3.transition().duration(750).tween("rotate", function() {
                        var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
                        return function(t) {
                            projection.rotate(r(t));
                            svg.selectAll("path")
                                .attr("d", path)
                                .classed("land-selected", function(d2, i) {
                                    return d2.id == d.id;
                                });
                        };
                    });
                })();
            }
            // But we always want the selected country to change appearance
            else {
                svg.selectAll("path")
                    .attr("d", path)
                    .classed("land-selected", function(d2, i) {
                        return d2.id == d.id;
                    });
            }
        })

        // Show tooltip
        .on("mousemove", function(d,i) {
            tooltip
                .classed("hidden", false)
                .attr("style", "left:"
                    + (d3.event.pageX - 20) + "px;top:"
                    + (d3.event.pageY - 40) +"px")
                .html(d.name);
        })

        // Hide tooltip
        .on("mouseout",  function(d,i) {
            tooltip.classed("hidden", true)
        });
}
