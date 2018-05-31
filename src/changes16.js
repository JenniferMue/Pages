//constants for both changes16.js and changes17.js
const minBubbleSize = 8;
const maxBubbleSize = 28;
const margin = {top: 15, right: 15, bottom: 0, left: 55};
//padding amount when setting the range of both scales
// used to prevent elements from being clipped.
const rangePadding = 25;
const format=d3.format('.2f');
var formatAsPercentage = d3.format(".1%");
/**
 displaying - changes 2015-2016 */
const graph16Width = 1024 - margin.left - margin.right;
const graph16Height = 850 - margin.top - margin.bottom;

// setup fill color
//A quantize scale functions as a linear scale, but it outputs values from within 
// a discrete range.
const bubbleColorScale = d3.scaleQuantile()
// .range(["#67cabc", "#00fa9a", "#3eb489", "#aaf0d1", "#00ffc0", "#d1c9ec", "#4f5ff0", "#00109e"]);
    .range(["#07153b", "#293fb9", "#246bba", "#1d91c0", "#41b6c4","#7fcdbb", "#c7e9b4","#FFFFD9"]);

const changes16_svg = d3.select('#changes16').append("svg")
    .attr("width", graph16Width + margin.left + margin.right)
    .attr("height", graph16Height + margin.top + margin.bottom)
    .append('g')
    .attr("transform", `translate(${margin.left},${margin.top})`);


/* Source
Tooltip index1.html from http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html -->
*/
/*
     * value accessor - returns the value to encode for a given data object.
     * scale - maps value to a visual display encoding, such as a pixel position.
     * map function - maps from data value to display value
     */

// add the tooltip area to the webpage
var changes16_tooltip = d3.select("changes16_svg").append("div")
    .attr("class", "tooltip")
    .style("opacity", 1);
// Tooltip
var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

// load data
d3.json("./data/e50ba_2016.json", function (error, data) {

    // change string (from CSV) into number format
    data.forEach(function (d) {
        d.rank_2016 = +d.rank_2016;
        d.change_2015_2016 = +d.change_2015_2016;
        d.millions = +d.millions;
        passengers_2016 = +d.passengers_2016;
        city_served = d.city_served;
        //console.log(d);
    });


    var bubbleColorDomain = bubbleColorScale.domain([
        d3.min(data, d => d.millions),
        d3.max(data, d => d.millions)
    ]);
    var sqrtScale = d3.scaleSqrt()
        .domain([d3.min(data, d => d.millions), d3.max(data, d => d.millions)])
        .range([minBubbleSize, maxBubbleSize]);
    
    var xScale16 = d3.scaleLinear()
        .domain([d3.min(data, d => d.rank_2016), d3.max(data, d => d.rank_2016)])
        .range([rangePadding, graph16Width- rangePadding]);
    var yScale16 = d3.scaleLinear()
        .domain([d3.min(data, d => d.change_2015_2016), d3.max(data, d => d.change_2015_2016)])
        .range([ graph16Height - rangePadding, rangePadding]);

    var xAxis16 = d3.axisBottom(xScale16); 
     
    var yAxis16 = d3.axisLeft(yScale16);     
    yAxis16.tickFormat(formatAsPercentage); 
    // x-axis
    changes16_svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (graph16Height / 12) * 8.94 + ")")
        .call(xAxis16.ticks(25))        
        .append("text")
        .attr("fill", "#333")
        .attr("x", graph16Width - rangePadding)
        .attr("y", -rangePadding)
        .attr("dy", "1em")
        .style("text-anchor", "end")
        .text("Rank");

    // y-axis
    changes16_svg.append("g")
        .attr("class", "axis")
        .call(yAxis16.ticks(10))
        .append("text")
        .attr("fill", "#333")
        .attr("transform", "rotate(-90)")
        .attr("y", rangePadding )
        .attr("dy", "1em")
        .style("text-anchor", "end")
        .text("Percentage Increase");

    /*tooltips */
    function showTooltip(d) {
        div.transition()
            .duration(200)
            .style("opacity", 1);
        div.html("Airport: " + d.airport + "<br/>" + " City served: " + d.city_served + "<br/>" + "Passengers: "
            + d.passengers_2016 + "<br/>"
            + "Rank: " + d.rank_2016 + "<br/>" + "Change from 2015 to 2016: " + d.change_2015_2016)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 100) + "px");
    };

    function hideTooltip(data) {
        div.transition()
            .duration(200)
            .style("opacity", 0);
    };

    // draw dots
    changes16_svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", d => sqrtScale(d.millions))
        .attr("cx", d=> xScale16(d.rank_2016))
        .attr("cy", d=> yScale16(d.change_2015_2016))
        .style("fill", d => bubbleColorScale(d.millions))
        .attr('fill-opacity', 0.5)
        .attr('stroke', "#3eb489")
        .attr('stroke-width', 0.25)
        .on("mouseover", d => showTooltip(d))
        .on("mouseout", hideTooltip);

    createLegend2016(data);
});


function createLegend2016(data) {    
    // legend
    var changes16_legend = changes16_svg.selectAll(".legend")
        .data(bubbleColorScale.range())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + (i) * 24 + ")"; });

    // draw legend colored circles
    changes16_legend.append("rect")
        .attr("x", graph16Width -rangePadding )
        .attr("width", 22)
        .attr("height", 22)
        .attr("fill", (d,i) =>bubbleColorScale.range()[i]);
    var quantiles = bubbleColorScale.quantiles();
    quantiles.push(75.71);
    // draw legend text
    changes16_legend.append("text")
        .attr("x", graph16Width -rangePadding - 36)
        .attr("y", 11)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .data(quantiles)
        .text(d => format(d) + " M");
        
   
}
 
   