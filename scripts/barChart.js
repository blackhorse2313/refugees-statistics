var genHorizontalBarchart = function(data, chartID) {

    var delimiter = d3.format(",.0f");
    data = data.slice(0, 5);

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
        .attr("fill", "#2C3E50")
        .attr("width", width / data.length - 5)
        .attr("height", function(d) {

            return height - y(d.applicants);
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
};

var genVerticalBarchart = function(data, chartID) {

    console.log(chartID);

    var height = 400,
        width = 400;

    var margin = {
        top: 10,
        bottom: 10,
        left: 90,
        right: 60
    };

    var dataEdit = [];
    var others = {
        country: "Others",
        applicants: 0
    };

    var i;

    for (i = 0; i < data.length; i++) {
        if (data[i].applicants > 5000) {
            dataEdit.push(data[i]);
        } else {
            others.applicants += data[i].applicants;
        }
    }



    //dataEdit.push(others);
    data = dataEdit;

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
        .attr("fill", "#2C3E50")
        .attr("width", function(d) {
            return x(d.applicants);
        })
        .attr("height", function(d) {
            return height / data.length;
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
