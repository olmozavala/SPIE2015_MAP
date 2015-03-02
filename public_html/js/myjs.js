var width = $(".maingraph").width();
var height = $(window).height() - 100;

var fileName = "data/world-countries.json";
//var fileName = "data/world.json";
var svg = d3.select('svg');

//Define projection
//var projection = d3.geo.albers()
//var projection = d3.geo.mercator()
//		.center([0,0])
//		.scale(180);

var projection = d3.geo.orthographic()
		.scale(290)
		.clipAngle(90)
		.translate([width / 2, height / 2])

//Define path
var path = d3.geo.path()
		.projection(projection);

//Graticule
var graticule = d3.geo.graticule();

var zoom = d3.geo.zoom().projection(projection)
//		.scaleExtent([projection.scale() * .7, projection.scale() * 10])
		.on("zoom.redraw", function() {
			//			d3.event.sourceEvent.preventDefault();
			svg.selectAll("path").attr("d", path);
			svg.selectAll("circle")
					.attr("cx",function(d){return projection(d.geometry.coordinates)[0]})
					.attr("cy",function(d){return projection(d.geometry.coordinates)[1]});
		});

$(window).resize(function(){
	width = $(".maingraph").width();
	height = $(window).height() - 100;
});

//jquery init function
$(function() {
	createMap();
});

function createMap(){
	d3.select('svg')
			.attr('width',width)
			.attr('height',height)
			.classed('world',true);
	
	//Adds the graticule
	svg.append("path")
			.datum(graticule)
			.attr("d", path)
			.classed("grid",true);
	
	// Reads the world countries
	d3.json(fileName, function(err, world) {
		
		svg.selectAll("path")
				.data(world.features)
				.enter()
				.append("path")
				.attr("d", path)
				.classed("land",true);
//				.on("mouseover", dispCountryName)
//				.on("mouseout", function(d){
//					highlight(this,false);
//			d3.select(".tooltip")
//					.style("opacity",0);
//		});	
		
		// Reads the universities 
		var locFile = "data/Locations.json";
		d3.json(locFile, function(err, spie2015) {
			
			var spie_loc = topojson.feature(spie2015, spie2015.objects);// TopoJSON -> GeoJSON
			
			var lonlat = [0,0];
			var xy = projection(lonlat);
			
			svg.selectAll("circle")
					.data(spie_loc.features)
					.enter()
					.append("circle")
					.attr("r",function(d){return d.properties.count/2;})
					.classed("institute",true)
					.on("mouseover", dispInstituteName)
					.on("mouseout", function(d){
						highlightInst(this,false);
				d3.select(".tooltipInst")
						.style("opacity",0);
			})	
					.attr("cx",function(d){return projection(d.geometry.coordinates)[0]})
					.attr("cy",function(d){return projection(d.geometry.coordinates)[1]});
			
			d3.selectAll("path").call(zoom);
		});
		
	});
	
	d3.select(".tooltip")
			.style("background", "rgba(250,250,250,.7)");
};

function dispCountryName(d){
	d3.select(".tooltip")
			.text(d.properties.name)
			.style("opacity",1)
			.style("left", (d3.event.pageX + 20) + "px")
			.style("top", (d3.event.pageY - 10) + "px");
	
	highlight(this, true);
}

function dispInstituteName(d){
	d3.select(".tooltipInst")
			.text(d.properties.name)
			.style("opacity",1)
			.style("left", (d3.event.pageX - 20) + "px")
			.style("top", (d3.event.pageY + 10) + "px");
	
	highlightInst(this, true);
}

function highlight(feature, status){
	d3.select(feature)
			.classed("land",!status)
			.classed("current",status);
}

function highlightInst(feature, status){
	d3.select(feature)
			.classed("institute",!status)
			.classed("currInst",status);
}