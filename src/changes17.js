/**
 displaying the changes in passenger numbers 2016-2017 */

 const graph17Width = 1024 - margin.left - margin.right;
 const graph17Height= 850 - margin.top - margin.bottom;

 // setup fill color
 //A quantize scale functions as a linear scale, but it outputs values from within
 // a discrete range.
 //http://colorpalettes.net/color-palette-3689/
const bubbleColorScale17 = d3.scaleQuantile()
// .range([ "#c3bb10", "#d8918e", "#e892a9", "#cd5768", "#daf4c6", "#8e070e"]);
    .range(["#07153b", "#293fb9", "#246bba", "#1d91c0", "#41b6c4","#7fcdbb", "#c7e9b4","#FFFFD9"]);

 const changes17_svg = d3.select('#changes17').append("svg")
                   .attr("width", graph17Width + margin.left + margin.right)
                   .attr("height", graph17Height + margin.top + margin.bottom)
                   .append('g')
                   .attr("transform", `translate(${margin.left},${margin.top})`);


// add the tooltip area to the webpage
var changes17_tooltip = d3.select("changes17_svg").append("div")
    .attr("class", "tooltip")
    .style("opacity", 1);

// load data
d3.json("./data/e50ba_2017.json", function(error, data) {

    // change string into number format
    data.forEach(function(d) {
        d.rank_2017 = +d.rank_2017;
        d.change_2016_2016 = +d.change_2016_2017;
        d.millions = +d.millions;
        passengers_2017= +d.passengers_2017;
        city_served = d.city_served;
       //console.log(d);
    });
    const maxBubbleColorDomainValue = d3.max(data, d=> d.millions);

    var bubbleColorDomain17 = bubbleColorScale17.domain([
                        d3.min(data, d=> d.millions),
                        maxBubbleColorDomainValue
                        ]);
    var sqrtScale17 = d3.scaleSqrt()
                        .domain([d3.min(data, d => d.millions), d3.max(data, d => d.millions)])
                        .range([minBubbleSize, maxBubbleSize]);


    var xScale17 = d3.scaleLinear()
        .domain([d3.min(data, d => d.rank_2017), d3.max(data, d => d.rank_2017)])
        .range([rangePadding, graph17Width - rangePadding]);
    var yScale17 = d3.scaleLinear()
        .domain([d3.min(data, d => d.change_2016_2017), d3.max(data, d => d.change_2016_2017)])
        .range([ graph17Height - rangePadding, rangePadding]);

    var xAxis17 = d3.axisBottom(xScale17);
    var yAxis17 = d3.axisLeft(yScale17);
    yAxis17.tickFormat(formatAsPercentage);
    // x-axis
    changes17_svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (graph17Height/7)*6.13 + ")")
        .call(xAxis17.ticks(25))
        .append("text")
        .attr("fill", "#333")
        .attr("x", graph16Width - rangePadding)
        .attr("y", -rangePadding)
        .attr("dy", "1em")
        .style("text-anchor", "end")
        .text("Rank");

    // y-axis
    changes17_svg.append("g")
        .attr("class", "axis")
        .call(yAxis17.ticks(10))
        .append("text")
        .attr("fill", "#333")
        .attr("transform", "rotate(-90)")
        .attr("y", rangePadding )
        .attr("dy", "1em")
        .style("text-anchor", "end")
        .text("Percentage Increase");


    function showTooltip (d) {
        div.transition()
            .duration(200)
            .style("opacity", 0.9);
        div.html("Airport: " + d.airport + "<br/>" + " City served: " + d.city_served + "<br/>"
             + "Passengers: " + d.passengers_2017 + "<br/>"
            + "Rank: " + d.rank_2017 + "<br/>" + "Change from 2017 to 2018: " + d.change_2016_2017)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 100) + "px");
    };

    function hideTooltip (data) {
        div.transition()
            .duration(200)
            .style("opacity", 0);
    };

    // draw dots
    changes17_svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", d => sqrtScale17(d.millions))
        .attr("cx", d => xScale17(d.rank_2017))
        .attr("cy", d => yScale17(d.change_2016_2017))
        .style("fill", d => bubbleColorScale17(d.millions))
        .attr('fill-opacity', 0.5)
        .attr('stroke', "#3eb489")
        .attr('stroke-width', 0.25)
        .on("mouseover", d=> showTooltip(d))
        .on("mouseout", hideTooltip);

        createLegend2017(data);
    });

    function createLegend2017(data){
        // legend
        var changes17_legend = changes17_svg.selectAll(".legend")
        .data(bubbleColorScale17.range())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + (i) * 24 + ")"; });

        // draw legend colored circles
        changes17_legend.append("rect")
            .attr("x", graph17Width -rangePadding )
            .attr("width", 22)
            .attr("height", 22)
            .attr("fill", (d,i) => bubbleColorScale17 .range()[i]);

        var quantiles17 = bubbleColorScale17.quantiles();
        quantiles17.push(78.04);
        // draw legend text
        changes17_legend.append("text")
            .attr("x", graph17Width -rangePadding - 36)
            .attr("y", 11)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .data(quantiles17)
            .text(d => format(d) + " M");
    }
