/*
The data behind this map was pulled together from 2 different
datasets from the Natural Earth (topojson countries and geocoordinates of international airports).
*/
                                                        function swapDivs(div1,div2,div3,div4)
{
   d1 = document.getElementById(div1);
   d2 = document.getElementById(div2);
   d3 =document.getElementById(div3);
   d4 = document.getElementById(div4);
   if( d1.style.display == "none" )
   {
      d1.style.display = "block";
      d2.style.display = "none";
      d3.style.display = "none";
      d4.style.display = "none";
   }
   else if ( d1.style.display = "block")
   {
      d3.style.display = "none";
      d4.style.display = "none";
      d2.style.display = "none";
   }
}

/**
D3 v4.x using topojsonv3
 */
var formatLabelAsPercentage = d3.format(".1%");
var mapWidth= 1024;
var mapHeight= 900;
var map_svg = d3.select('#map').append("svg")
                  .attr("width", mapWidth)
                  .attr("height", mapHeight)
                  .style("border", "1px solid #555");
const url= './data/topojson/world-50m.json';

//const url="https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-50m.json";

var projection = d3.geoMercator()
          .center([10, 50])
          .scale([1000])
          .translate([mapWidth / 2, mapHeight / 2]);
 //define path generator and specify a projection for it to use
var geoGenerator = d3.geoPath().projection(projection);

//generate a geographic map
function createMap(data){
    
  var countries=topojson.feature(data, data.objects.countries).features,
	    neighbors = topojson.neighbors(data.objects.countries.geometries);
  
  var color = d3.scaleOrdinal(d3.schemeGreys[9]);
   map_svg.selectAll('path')
    	.data(countries)
        .enter()
        .append("path")
        .attr("class", "land")
        .attr("d", geoGenerator)       
        .style("fill", function (d, i) {
                    return color(d.color = d3.max(neighbors[i],
                        function (n) { return countries[n].color; }) + 1 | 0);
                }); 
       

/*      map_svg.append("path")
                .datum(topojson.mesh(data, data.objects.countries))
                .attr("d", path);  */ 
        
}
 
function createBubbles(airportdata){
        passengers_2017 = +airportdata.passengers_2017;
        rank_2017 = +airportdata.rank_2017;
        airport= +airportdata.airport;
        millions = +airportdata.millions;
        change_2016_2017 = +airportdata.change_2016_2017;
        //defining the scale for the radius of the circles
        const minRange = 8;
        const maxRange = 32;
        var minDomain = d3.min(airportdata, d => d.millions);
        var maxDomain = d3.max(airportdata, d => d.millions);
        var minChange = d3.min(airportdata,d => d.change_2016_2017);
        var maxChange = d3.max(airportdata, d => d.change_2016_2017)

        // set the colors       
        var circleSqrtScale = d3.scaleSqrt().domain([minDomain, maxDomain]).range([minRange, maxRange]);
        var circleColorScale = d3.scaleLinear()
                    .range(["#1d91c0", "#FFFFD9"]);
        circleColorScale.domain([ minChange,maxChange]);

        /*create circles to represent airports and position each circle
        according to the geocoordinates of the corresponding airport
        The map projection takes a two-value array as input, with longitude first,then latitude.
        the json files provides the coordinates as an array - lon first,then lat.
        Then the projection returns a two-value array with x/y screen values.
        For cx, we use [0] to grab the first of those values.
        For cy, we use [1] to grab the second of those values, which is y.
        */
       map_svg.selectAll("circle")
       .data(airportdata)
       .enter()
       .append("circle")
       .attr("cx", d=>projection([d.coordinates[0],d.coordinates[1]])[0])
       .attr("cy", d=>projection([d.coordinates[0], d.coordinates[1]])[1])
       .attr("r", d => circleSqrtScale(d.millions))
       .attr("class", "bubble")     
       .style("fill", d => {
                var value= d.change_2016_2017;
                if(value){
                        return circleColorScale(value)
                } else{
                        return "#FC4354";
                }
        })
       .style("stroke", "#222")
       .style("stroke-width", 0.5)
       .style("opacity",1)
       .append("title")
       .text(d => d.airport+ ", "+ d.city_served +" | Rank: "+d.rank_2017
                        +"| Number of passengers: "+
                d.passengers_2017 +" | Increase Rate: "+formatLabelAsPercentage(d.change_2016_2017));


}


//load in TopoJSON data and pass it to the function createMap(data)
//load in airports data with the airport coordinates
 d3.queue()
        .defer(d3.json, url)
        .defer(d3.json, "./data/e50ba_2017.json")
        .await(analyze);
      
      function analyze(error, data, airportdata) {
        if(error) { console.log(error); }
      
        console.log(data[0]);
        console.log(airportdata[0]);
        createMap(data);       
        createBubbles(airportdata);
      } 

