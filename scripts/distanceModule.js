angular.module('distanceModule', [])
    .controller('distanceCtrl', ['$scope', '$http', function($scope, $http) {
        
        var i, j;
        var scale = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];

        queue()
            .defer(d3.json, "data/world-110m.json")
            .defer(d3.tsv, "data/world-country-names.tsv")
            .await(genVis);
    }]);

function genVis(error, world, names) {
    if (error) throw error;

    var width = 800, height = 800;
    var svg = d3.select("#globe").append("svg")
        .attr("width", width)
        .attr("height", height);

    var projection = d3.geo.azimuthalEquidistant()
        .scale(100)
        .translate([width / 2, height / 2])
        .clipAngle(180 - 1e-3)
        .precision(.1);

    var path = d3.geo.path().projection(projection);

    //// Globe lines (graticule)

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

    //// Countries

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

        // Rotate globe to selected country
        .on("click", function(d,i) {
            var p = d3.geo.centroid(countries[i]);
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
        })

        // Show tooltip
        .on("mousemove", function(d,i) {
            var mouse = d3.mouse(svg.node()).map(function(d) {
                return parseInt(d);
            });
            tooltip
                .classed("hidden", false)
                .attr("style", "left:"+(mouse[0]+25)+"px;top:"+(mouse[1]+150)+"px")
                .html(d.name);
        })

        // Hide tooltip
        .on("mouseout",  function(d,i) {
            tooltip.classed("hidden", true)
        });
}
