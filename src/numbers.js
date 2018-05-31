
/** passenger number ranges screen, it should use a reusable bubble chart (bubble_graph.js) */
var rangesWidth= 1024;
var rangesHeight = 750;

var ranges=["78 - 44 Million","40 - 26 Million", "26 - 18 Million", "18 - 13 Million","13 - 10 Million"];
var colorScale = ["#293fb9", "#246bba", "#41b6c4","#7fcdbb", "#c7e9b4"];



var xCenter = [120, 370, 570, 770, 910];
//var xScale = d3.scaleLinear().domain([0, 1]).range([0, rangesWidth]);


// Save a reference to the original d3.select function
const select = d3.select;

// Re-define select
d3.select = function (selector) {
    // If the selector is already a selection, just return it
    // otherwise call the original d3.select function
    if (selector instanceof d3.selection) return selector;
    return select(selector);
};

//defining the scale for the radius of the circles
var sqrtScale = d3.scaleSqrt().domain([0, 78]).range([0, 50]);

//based on the examples available at http://d3indepth.com/force-layout/
function createGraph(data){
  var numNodes = 50;
  var nodes = data.map(function(d, i) {
    return {
      radius: sqrtScale(d.millions),
      category: Math.floor(i/10),
      airport: d.airport,
      total: d.passengers_2017,
      city: d.city_served,
      millions: d.milllions
    }
  });

  /*
  - initialize a force layout, passing in a reference to the nodes
  -forceManyBody() creates a “many-body” force that acts on all nodes, meaning this can be used to
  either attract all nodes to each other or repel all nodes from each other.
  - apply a positive strngth value to attract.
  - forceX() centers each category around the respective x coordinate specified in the var XCenter  
  -  forceY() centers each category around the same specified y coordinate (190)
  */
  var simulation = d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(7))
    .force('x', d3.forceX().x(function(d) {
      return xCenter[d.category];
     //return xScale(d.category);
    }))
    .force('y', d3.forceY().y(function(d) {
      return 190;
    })) 
    .force('collision', d3.forceCollide().radius(d=> d.radius))
    .on('tick', ticked);
    /*
    With on("tick", …), we are specifying how to take those
    updated coordinates and map them on to the visual elements in the DOM.
    */
    function ticked() {
      
      var u = select('#numbers svg > g')
        .selectAll('circle')
        .data(nodes);
    
      var u2= u.enter()
        .append('circle')
        .attr('r', d =>d.radius)
        .attr("class", "node")
        .style('fill', function(d) {
          return colorScale[d.category];
        })
        .append('title')
        .text(d=>{return d.airport+" | City served: "+ d.city +" | Number of Passengers: "+d.total}); 
        //on every tick through time, take the new x/y values for each circle and update them in the DOM
        //d3 calculates these x/y values and appends them to the existing objects in our original nodes dataset
        u2.merge(u)
        .attr('cx', d => d.x)
        .attr('cy',d => d.y)
        
        u.exit().remove();  
       // console.log(nodes);
/*         var text = select('#numbers svg > g')
                      .append("text")
                      .attr("x", 5)
                      .attr("y", 400)
                      .text( "Passenger Numbers in 2017 including terminal passengers .")
                      .attr("dy", "1em")
                      .attr("fill", "#333"); */    
         
        var legend = select("#numbers svg").selectAll(".legend")
                    .data(ranges)
                    .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", (d, i)=> { return "translate(0," + (i+2) * 24 + ")"; });
                    
                    legend.append("rect")
                      .attr("x", rangesWidth - 68)
                      .attr("width", 20)
                      .attr("height", 20)
                      .style("fill", (d,i)=>colorScale[i]);
                    
                    legend.append("text")
                      .attr("x", rangesWidth - 74)
                      .attr("y", 12)
                      .attr("dy", ".35em")
                      .style("text-anchor", "end")
                      .text(d=>d);
    }
    
}


d3.json("./data/e50ba_2017.json", function(error, data){
    if (error) return console.error(error);
    console.log(data);
    data.millions = +data.millions;
    data.passengers_2017 = +data.passengers_2017;
    createGraph(data);
  })
  