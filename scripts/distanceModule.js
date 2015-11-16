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

    var projection = d3.geo.azimuthalEquidistant()
        .scale(100)
        .translate([width / 2, height / 2])
        .clipAngle(180 - 1e-3)
        .precision(.1);

    var path = d3.geo.path()
        .projection(projection);

    var graticule = d3.geo.graticule();

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Globe lines
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

    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);


/*
      svg.insert("path", ".graticule")
          .datum(topojson.feature(world, world.objects.land))
          .attr("class", "land")
          .attr("d", path);

      svg.insert("path", ".graticule")
          .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
          .attr("class", "boundary")
          .attr("d", path);
*/
    d3.select(self.frameElement).style("height", height + "px");

    var countries = topojson.feature(world, world.objects.countries).features,
      neighbors = topojson.neighbors(countries),
      i = -1,
      n = countries.length;

  countries.forEach(function(d) { 
    var tryit = names.filter(function(n) { return d.id == n.id; })[0];
    if (typeof tryit === "undefined"){
      d.name = "Undefined";
    } else {
      d.name = tryit.name; 
    }
  });

var country = svg.selectAll(".country").data(countries);
  country
   .enter()
    .insert("path")
    .attr("class", "country")    
      .attr("title", function(d,i) { return d.name; })
      .attr("d", path)
      .style("fill", "#ddd");

    // Show/hide tooltip
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");
    country
      .on("click", function(d,i) {
        //var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
        //console.log(mouse[0]);
        console.log(d3.geo.centroid(countries[i]));
       /* 
        country
            .enter()
            .attr("title", function(target_d, target_i) {return target_d.name == d.name})
            .style("fill", "red")
*/
        //.style("fill", "red");
        })
      .on("mousemove", function(d,i) {
        var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
        tooltip
          .classed("hidden", false)
          .attr("style", "left:"+(mouse[0]+25)+"px;top:"+(mouse[1]+150)+"px")
          .html(d.name);
      })
      .on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true)
      });
}
