var continents = [{
    continentCode: "AF",
    country: "Africa",
    color: "#18bc9c"
}, {
    continentCode: "AS",
    country: "Asia",
    color: "#3498db"
}, {
    continentCode: "EU",
    country: "Europe",
    color: "#2C3E50"
}];


var genHorizontalBarchart = function(data, chartID, map) {
    var delimiter = d3.format(",.0f");

    var height = 380,
        width = 530;

    var margin = {
        top: 10,
        bottom: 30,
        left: 10,
        right: 10
    };

    var x = d3.scale.ordinal()
        .rangeBands([0, width])
        .domain(data.map(function(d) {
            return d.country;

        }));

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([0, d3.max(data, function(d) {
            return d.applicants;
        })]);

    var svg = d3.select("#" + chartID)
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var barPadding = 5;
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "verticalBar")
        .attr("x", function(d) {
            return x(d.country);
        })
        .attr("y", function(d) {
            return y(d.applicants);
        })
        .style("cursor",function(d){
            var cursor = "auto";
            if (chartID === "verbarEmigrants" ||chartID === "verbarContinents"){
                cursor = "pointer";
            }
            return cursor;
        })
        .attr("fill", function(d) {
            var color = "#2c3e50";
            if (chartID === "verbarEmigrants") {
                continents.forEach(function(continent) {
                    if (d.continent == continent.continentCode) {
                        color = continent.color;
                    }
                });
            } else if (chartID === "verbarContinents") {
                continents.forEach(function(continent) {
                    if (d.continentCode == continent.continentCode) {
                        color = continent.color;
                    }
                });
            }
            return color;
        })
        .attr("width", width / data.length - 5)
        .attr("height", function(d) {

            return height - y(d.applicants);
        }).on("click", function(d) {
            if (chartID === "verbarContinents") {
                change(d.continentCode);
            }
            if (chartID === "verbarEmigrants") {
                selectCountry(d.continent);
            }
            console.log("VERT RECT");
        }).on("mouseover", function(d) {
            map.selectCountryByName(d.country);
        }).on("mouseout", function(d) {
            map.selectCountryByName("");
        });

    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom");

    svg
        .append("g")
        .attr("class", "x axis verticalBarAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);


    svg.append("g").selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .text(function(d) {
            return delimiter(d.applicants);
        })
        .attr("x", function(d) {
            return x(d.country) + (width / data.length) / 2;
        })
        .attr("y", function(d) {
            return y(d.applicants) + 15;
        })
        .style("fill", "white")
        .attr("text-anchor", "middle");


    if (chartID === "verbarEmigrants") {
        ////////////////////////////////////////////
        /////////// Initiate legend ////////////////
        ////////////////////////////////////////////
        var legendSvg = d3.select('#verbarEmigrants')
            .selectAll('svg')
            .append('svg')
            .attr("width", 1000)
            .attr("height", 1000)
            .attr("stroke", "solid black");

        var legendTop = 30;
        //Create the title for the legend
        var text = legendSvg.append("text")
            .attr("class", "title")
            .attr('transform', 'translate(90,0)')
            .attr("x", width - 200)
            .attr("y", 10 + legendTop)
            .attr("font-size", "12px")
            .attr("fill", "#404040")
            .style("font-weight", "bold")
            .text("Continents");


        //Initiate Legend   
        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("height", 100)
            .attr("width", 200)
            .attr('transform', 'translate(90,20)');
        //Create colour squares
        legend.selectAll('rect')
            .data(continents)
            .enter()
            .append("rect")
            .attr("x", width - 215)
            .attr("y", function(d, i) {
                return i * 20 + legendTop;
            })
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function(d, i) {
                return d.color;
            });
        //Create text next to squares
        legend.selectAll('text')
            .data(continents)
            .enter()
            .append("text")
            .attr("x", width - 200)
            .attr("y", function(d, i) {
                return i * 20 + 9 + legendTop;
            })
            .attr("font-size", "11px")
            .attr("fill", "#737373")
            .text(function(d) {
                return d.country; //Continent in Origin Countries
            });
    }
};

function processData(data) {
    var processedData = [];
    var i;
    for (i = 0; i < data.length; i++)
        if (data[i].applicants > 1000)
            processedData.push(data[i]);

    return processedData;
}

var genVerticalBarchart = function(data, chartID, map) {
    var height = 400,
        width = 400;

    var margin = {
        top: 10,
        bottom: 10,
        left: 110,
        right: 60
    };

    /*
    var others = {
        country: "Others",
        applicants: 0
    };

    var i;
    for (i = 0; i < data.length; i++) {
        if (data[i].applicants > 1000) {
            dataEdit.push(data[i]);
        } else {
            others.applicants += data[i].applicants;
        }
    }
    
    dataEdit.push(others);
    */

    data = processData(data);

    var y = d3.scale.ordinal()
        .rangeBands([0, height])
        .domain(data.map(function(d) {
            return d.country;

        }));

    var x = d3.scale.linear()
        .range([0, width])
        .domain([0, d3.max(data, function(d) {
            return d.applicants;
        })]);

    var svg = d3.select("#" + chartID)
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "verticalBar")
        .attr("x", function(d) {
            return 0;
        })
        .attr("y", function(d) {
            return y(d.country);
        })
        .attr("fill", function(d) {
            var color = "#2C3E50";
            if (chartID == "horbarEmigrants") {
                continents.forEach(function(continent) {
                    if (d.continent == continent.continentCode) {
                        color = continent.color;
                    }
                });
            }
            return color;
        })
        .attr("width", function(d) {
            return x(d.applicants);
        })
        .attr("height", function(d) {
            return height / data.length;
        })
        // Country in map is also selected
        .on("click", function(d) {
            console.log("HORZ RECT");
        }).on("mouseover", function(d) {
            map.selectCountryByName(d.country);
        }).on("mouseout", function(d) {
            map.selectCountryByName("");
        });

    var yAxis = d3.svg.axis().scale(y)
        .orient("left");

    svg
        .append("g")
        .attr("class", "y axis")
        .call(yAxis);


    svg.append("g").selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .text(function(d) {
            return delimiter(d.applicants);
        })
        .attr("x", function(d) {
            return x(d.applicants) + 5;
        })
        .attr("y", function(d) {
            return y(d.country) + (height / data.length) / 2;
        })
        .attr("dy", "0.32em")
        .style("fill", "black");
};
