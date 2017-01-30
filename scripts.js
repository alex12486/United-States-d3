var width = 960, height = 600;
var legendText = ["Cities Lived", "States Lived", "States Visited", "Nada"];
var color = ["rgb(217,91,67)", "rgb(84,36,55)", "rgb(69,173,168)", "rgb(213,222,217)"];
var svg = d3.select('.diagram')
	.append('svg')
	.attr('width', width)
	.attr('height', height)
	.append('g');

var div = d3.select("body")
	.append("div")   
	.attr("class", "tooltip")               
	.style("opacity", 0);

var legend = svg.append('g')
	.attr('class', 'legends')
	.attr('transform', 'translate(' + (width - 100) + ',' + (height - 200) + ')')
	.selectAll('g')
	.data(legendText)
	.enter()
	.append('g')
	.attr('class', 'legend')
	.attr('transform', function(d, i) { console.log(i); return 'translate(0,' + (i * 25 + 50) + ')'});
	

var rect = legend.append('rect')
	.attr('width', 20)
	.attr('height', 20)
	.attr('x', 0)
	.attr('y', 0)
	.attr('fill', function(d, i) { return color[i] });

var text = legend.append('text')
	.text(function(d) { return d })
	.attr('x', 0)
	.attr('y', 0)
	.attr('transform', 'translate(25,15)')
	.attr('font-size', '13');
	

var projection = d3.geoAlbersUsa().translate([width / 2, height / 2]).scale(1280);
var path = d3.geoPath().projection(projection);

d3.queue()
	.defer(d3.json, './libs/us-states.json')
	.defer(d3.csv, './libs/cities-lived.csv')
	.defer(d3.csv, './libs/stateslived.csv')
	.await(render);

function render(error, states, citiesInformation, statesInformation) {

	var statesVisited = [];
	var statesLived = [];
	statesInformation.forEach(function(value) {
		if (value.visited == 1){
			statesVisited.push(value.state);
		} else if (value.visited == 2) {
			statesLived.push(value.state);
		}
	});

	var states = svg.append('g')
		.attr('class', 'states')
		.selectAll('.state')
		.data(states.features)
		.enter().append('path')
		.attr('class', function(d) { return d.properties.name.toLowerCase().replace(' ', '-') })
		.attr("stroke", "white")
		.attr('fill', function(d) {
			if (statesLived.indexOf(d.properties.name) > -1) {
				return 'rgb(84, 36, 55)';
			} else {
				return statesVisited.indexOf(d.properties.name) > -1 ? 'rgb(69, 173, 168)' : 'rgb(213, 222, 217)';
			}
		})
		.attr('stroke-width', 1)
		.attr('d', path)
		.on('mouseover', function(d) {
			d3.select(this).attr('fill-opacity', 0.7)
		})
		.on('mouseout', function(d) {
			d3.select(this).attr('fill-opacity', 1)
		});

	var city = svg.append('g')
		.attr('class', 'cities')
		.selectAll('.city')
		.data(citiesInformation)
		.enter().append('circle')
		.attr('class', 'city')
		.attr('cx', function(d) { return projection([d.lon,d.lat])[0] })
		.attr('cy', function(d) { return projection([d.lon,d.lat])[1] })
		.attr('r', function(d) { return Math.sqrt(d.years) * 4 })
		.attr('fill', 'rgb(217, 91, 67)')
		.attr('opacity', '0.85')
		.on("mouseover", function(d) {      
  		div.transition()        
    	   .duration(200)      
         .style("opacity", .9);      
         div.text(d.place)
         .style("left", (d3.event.pageX) + "px")     
         .style("top", (d3.event.pageY - 28) + "px");    
		})   
             
	  .on("mouseout", function(d) {       
	      div.transition()        
	         .duration(500)      
	         .style("opacity", 0);   
    });

}


