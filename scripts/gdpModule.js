angular.module('gdpModule', ['angularAwesomeSlider'])
    .controller('gdpCtrl', ['$scope', '$http', function($scope, $http) {

        $http.get('data/applicants_gdp.json')
            .then(function(res) {
                var table = [];
                var set = [],
                    set2 = [];
                var arr = res.data.data;
                arr.sort(function(a, b) {
                    return b.applicants - a.applicants;
                });
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].year === 2015) {
                        table.push(arr[i]);
                    }

                }
                // select the top 5 values
                for (var j = 0; j < 10; j++) {
                    set.push(table[j]);
                    set2.push(table[j]);
                }
                $scope.list = set2;
                $scope.countries = set;
                console.log(set);
                gen_vis($scope.countries);
            });

        $scope.myClick = function(country) {
            console.log(country);
            var foundItem = false;
            for (var i = $scope.countries.length; i--;) {
                if ($scope.countries[i].iso2 === country) {
                    $scope.countries.splice(i, 1);
                    foundItem = true;
                }
            }
            if (!foundItem) {
                for (var j = $scope.list.length; j--;) {
                    if ($scope.list[j].iso2 === country) {
                        $scope.countries.push($scope.list[j]);
                    }
                }
            }
            $scope.countries.sort(function(a, b) {
                    return b.applicants - a.applicants;
                });
            $("svg").remove();
            gen_vis($scope.countries);
        };

    }]);


// d3
function gen_vis(dataset) {
    var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 50
        },
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], 0.1);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var y = d3.scale.linear()
        .range([height, 0]);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    /* SVG */
    var svg = d3.select("#immigrants_top5")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    /* Values for x-axis */
    x.domain(dataset.map(function(d) {
        return d.country;
    }));
    /* Values for y-axis */
    y.domain([0, d3.max(dataset, function(d) {
        return d.applicants;
    })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .attr("style", "font: 12px sans-serif;")
        .call(xAxis);

    /*
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
    */

    /* Bars */
    var bar = svg.selectAll(".bar")
        .data(dataset)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {
            return x(d.country);
        })
        .attr("width", x.rangeBand())
        .attr("y", function(d) {
            return y(d.applicants);
        })
        .attr("height", function(d) {
            return height - y(d.applicants);
        });

    /* Bar-text */
    var yTextPadding = 20;
    svg.selectAll(".bartext")
        .data(dataset)
        .enter()
        .append("text")
        .attr("class", "bartext")
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("x", function(d) {
            return x(d.country) + x.rangeBand() / 2;
        })
        .attr("y", function(d) {
            return y(d.applicants) + 20;
        })
        .text(function(d) {
            return d3.format(",")(d.applicants);
        });
}
