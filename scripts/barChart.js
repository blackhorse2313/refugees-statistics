var genHorizontalBarchart = function(data, chartID) {

	var delimiter = d3.format(",.0f");
    data = data.slice(0, 5);

    var height = 300,
        width = 300;

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

    var svg = d3.select("#"+chartID)
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
        .attr("class","verticalBar")
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
            return x(d.country)+(width / data.length)/2;
        })
        .attr("y", function(d) {
            return y(d.applicants)+15;
        })
        .style("fill","white")
        .attr("text-anchor","middle");

};
