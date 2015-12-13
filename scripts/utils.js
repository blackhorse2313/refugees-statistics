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


function World(worldType, world, names) {
    var self = this;

    // Used for computing flux in scatterplot selection
    this.destinationsOrigin = "";
    this.destinationsData = [];
    this.dotColor = undefined;

    ////
    //// Projection
    ////

    this.projection;
    this.width, this.height;
    var rotatable; // Rotates map on country selection
    var attribute; // Page attribute to append map

    // Distance module
    if (worldType == WorldType.EQUIDISTANT) {
        this.width = 450, this.height = 450;
        rotatable = true;
        attribute = "#world-equidistant";
        this.projection = d3.geo.azimuthalEquidistant()
            .scale(230)
            .translate([(this.width / 2), (this.height / 2)])
            .clipAngle(180 - 1e-3)
            .precision(.1);

        // Major Countries module
    } else if (worldType == WorldType.EQUIRECTANGULAR) {
        this.width = 600, this.height = 400;
        rotatable = false;
        attribute = "#world-equirectangular";
        this.projection = d3.geo.equirectangular()
            .scale(130)
            .translate([(this.width / 2) - 25, (this.height / 2) + 60])
            .precision(.1);
    } else if (worldType == WorldType.EUROPE) {
        this.width = 400, this.height = 400;
        rotatable = false;
        attribute = "#europe";
        this.projection = d3.geo.equirectangular()
            .scale(600)
            .translate([this.width / 2, this.height / 2])
            .rotate([-8, -52])
            .precision(.1);
    } else {
        console.log("@World: Invalid WorldType");
    }

    this.svg = d3.select(attribute).append("svg")
        .attr("width", this.width)
        .attr("height", this.height);

    this.path = d3.geo.path().projection(this.projection);

    // Define groups to enforce drawing order
    var g = this.svg.append("g");
    var graticulateGroup = g.append('g');
    var countryGroup = g.append('g');
    this.arcGroup = g.append('g');

    ////
    //// Globe lines (graticule)
    ////

    if (worldType == WorldType.EQUIDISTANT) {
        var graticule = d3.geo.graticule();
        graticulateGroup.append("path")
            .datum(graticule)
            .attr("class", "graticule")
            .attr("d", this.path);
    }

    ////
    //// Countries
    ////

    // Assign country names
    this.countries = topojson.feature(world, world.objects.countries).features;
    this.countries.forEach(function(d) {
        var tryit = names.filter(function(n) {
            return d.id == n.id;
        })[0];
        if (typeof tryit === "undefined") {
            d.name = "Undefined";
        } else {
            d.name = tryit.name;
        }
    });

    // Displays country name on the map
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .classed("hidden", true);

    // Assign country data, with key = id
    this.country = countryGroup.selectAll(".country").data(this.countries, function(d) {
        return d.id;
    });

    // Country selection
    this.country
        .enter()
        .insert("path")
        .attr("d", this.path)
        .attr("class", "land")
        .on("mousemove", function(d, i) {
            tooltip
                .classed("hidden", false)
                .attr("style", "left:" + (d3.event.pageX - 20) + "px;top:" + (d3.event.pageY - 40) + "px")
                .html(d.name);
        })
        .on("mouseout", function(d, i) {
            tooltip.classed("hidden", true)
        });
}

//
// Major Countries module functions
//

World.prototype.zoomToRegion = function(x, y, scale) {
    this.svg.selectAll("path").transition()
        .duration(750)
        .style("stroke-width", 1 / scale + "px")
        .attr("transform", "translate(" + [x, y] + ")scale(" + scale + ")");
};

World.prototype.selectCountryByID = function(id) {
    this.svg.selectAll("path")
        .attr("d", this.path)
        .classed("land-selected", function(d, i) {
            return d.id == id;
        });
};

World.prototype.selectCountryByName = function(countryName) {
    this.svg.selectAll("path")
        .attr("d", this.path)
        .classed("land-selected", countryName === "" ? false : function(d, i) {
            return d.name === countryName;
        });
};

World.prototype.fillCountriesByApplicants = function(data) {
    // Interpolate colors (between normal country fill and bar chart rect)
    var length = data.length;
    var colors = d3.scale.linear()
        .domain([data[length - 1].applicants, data[0].applicants])
        .interpolate(d3.interpolateRgb)
        .range([d3.rgb("#afc8e0"), d3.rgb("#2c3e50")]);

    // Add color to countries
    this.country
        .attr("d", this.path)
        .attr("class", "land")
        .style({
            fill: function(d) {
                for (var i = 0; i < length; i++) {
                    if (d.name === data[i].country) {
                        return colors(data[i].applicants);
                    }
                }
                return "url(#pattern-stripe)";
            }
        });
};

//
// Distance module functions
//

////////////////////////////////////////////////////////////
World.prototype.expandMap = function(expand) {
    if (expand == true) {
        this.width = 900, this.height = 900;
        rotatable = true;
        attribute = "#world-equidistant";
        this.projection = d3.geo.azimuthalEquidistant()
            .scale(460)
            .translate([(this.width / 2), (this.height / 2)])
            .clipAngle(180 - 1e-3)
            .precision(.1);
    } else {
        this.width = 450, this.height = 450;
        rotatable = true;
        attribute = "#world-equidistant";
        this.projection = d3.geo.azimuthalEquidistant()
            .scale(230)
            .translate([(this.width / 2), (this.height / 2)])
            .clipAngle(180 - 1e-3)
            .precision(.1);
    }
    this.svg.transition().duration(1000).attr("width", this.width)
        .attr("height", this.height);

    this.path = d3.geo.path().projection(this.projection);

    this.country
        .attr("d", this.path)
        .attr("class", "land");

    this.restoreDestinations();
};
//////////////////////////////////////////////////////////////////////////////////

World.prototype.computeCentroidByName = function(country) {
    var id = -1;
    for (var i = 0, length = this.countries.length; i < length; i++) {
        var indexedCountry = this.countries[i];
        if (indexedCountry.name === country) {
            id = i;
            break;
        }
    };

    return d3.geo.centroid(this.countries[id]);
};

World.prototype.rotateAndFillCountries = function(originName, destinations) {
    var p = this.computeCentroidByName(originName);
    var self = this;
    (function transition() {
        d3.transition().duration(750).tween("rotate", function() {
            var r = d3.interpolate(self.projection.rotate(), [-p[0], -p[1]]);
            return function(t) {
                self.projection.rotate(r(t));
                self.fillCountriesByDestinations(originName, destinations);
            };
        });
    })();
};

World.prototype.updateDestinations = function(origin, data) {
    this.destinationsOrigin = origin;
    this.destinationsData = data;
}

World.prototype.restoreDestinations = function() {
    this.drawFlux(this.destinationsOrigin, this.destinationsData);
    this.rotateAndFillCountries(this.destinationsOrigin, this.destinationsData);
}

World.prototype.fillCountriesByDestinations = function(originName, destinations) {
    var self = this;

    this.country
        .attr("d", this.path)
        .attr("class", "land")
        .style({
            fill: function(d) {
                if (d.name === originName) {
                    return "#000";
                }
                for (var i = 0; i < destinations.length; i++) {
                    if (d.name === destinations[i].destination) {
                        return self.dotColor(originName);
                    }
                }
                return "url(#pattern-stripe)";
            }
        });
    this.svg.selectAll("path")
        .attr("d", this.path);
};

World.prototype.computeFluxColor = function(applicants_population) {
    var length = this.destinationsData.length;
    var colors = d3.scale.linear()
        .domain([
            this.destinationsData[length - 1].applicants_population,
            this.destinationsData[0].applicants_population
        ])
        .interpolate(d3.interpolateRgb)
        .range([d3.rgb("#afc8e0"), d3.rgb("#2c3e50")]);

    return colors(applicants_population);
};

World.prototype.drawFlux = function(originName, destinations) {
    var self = this;

    var origin = this.computeCentroidByName(originName);
    var links = [];
    for (var i = 0; i < destinations.length; i++) {
        links.push({
            name: destinations[i].destination,
            applicants: destinations[i].applicants_population,
            type: "LineString",
            coordinates: [
                origin,
                this.computeCentroidByName(destinations[i].destination)
            ]
        });
    }

    // Sort links so that links with higher number of applicants
    // are drawn on top of other links (i.e. better visibility)
    links.sort(function(a, b) {
        return d3.ascending(a.applicants, b.applicants);
    });

    var pathArcs = this.arcGroup.selectAll(".arc").data(links);

    // enter
    pathArcs.enter()
        .append("path")
        .attr({
            'class': 'arc'
        })
        .style({
            fill: 'none'
        });

    // update
    // d is the points attribute for this path, we'll draw
    // an arc between the points using the arc function
    pathArcs
        .attr({
            d: this.path
        })
        .style({
            stroke: function(d) {
                for (var i = 0; i < destinations.length; i++) {
                    if (d.name === destinations[i].destination) {
                        return self.computeFluxColor(destinations[i].applicants_population);
                    }
                }
                return "none";
            },
            'stroke-width': '2px'
        });

    // exit
    pathArcs.exit().remove();
};
