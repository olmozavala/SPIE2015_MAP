var fileName = "data/world-countries.json";
var highlight_color = "#A01E1E";

var zoom = d3.geo.zoom().projection(projection)
//            .scaleExtent([projection.scale() * .7, projection.scale() * 10])
		.on("zoom.redraw", function() {
			refreshMap(); });

function refreshMap(){
	svg.selectAll("path").attr("d", path);
	svg.selectAll("circle")
			.attr("cx",function(d){return projection(d.geometry.coordinates)[0]})
			.attr("cy",function(d){return projection(d.geometry.coordinates)[1]});
	
}

//jquery init function
function renderMap(){
	
	//Adds the graticule
	map.append("path")
			.datum(graticule)
			.attr("d", path)
			.classed("grid",true);
	
	var renderWorld = new Promise(function(resolve, reject) {
		d3.json(fileName, function(err, data) {
			if (err){
				reject(Error("Not able to render the world"));
			}else{
				var world = svg.append("g");
				world.selectAll("path")
						.data(data.features)
						.enter()
						.append("path")
						.attr("d",path)
						.attr("id",function(d,i){return "country"+i;})
						.classed("land",true)
						.on("click", dispCountryName)
						.on("mouseenter", function(d,i){ $("#country"+i).css("fill","blue");})
						.on("mouseout", function(d,i){
							d3.select("#tooltip").style("opacity",0);
					$("#country"+i).css("fill","black");
				});
				
				resolve("Countries loaded correctly");
			}
		});
	});
	
	renderWorld.then(function(result) {
		d3.json("data/Locations.json", function(err, data) {
			if (err){
				dispError("Not able to display counties");
			}else{
				var spie_loc = topojson.feature(data, data.objects);// TopoJSON -> GeoJSON
				
				svg.selectAll("circle")
						.data(spie_loc.features)
						.enter()
						.append("circle")
						.classed("institute",true)
						.attr("r",function(d){return d.properties.count/2;})
						.attr("id",function(d,i){return i;})
						.attr("cx",function(d){return projection(d.geometry.coordinates)[0]})
						.attr("cy",function(d){return projection(d.geometry.coordinates)[1]})
						.style("fill",function(d){return colors(d.properties.count);})
						.on("mouseover", dispInstituteName)
						.on("mouseout", function(d,i){
							d3.select("#tooltip").style("opacity",0);
					$("#"+i).css("fill",colors(d.properties.count));
				});
				
				d3.selectAll("path").call(zoom);

				$(window).resize(resizeMap);
			}
		});
	}, function(err) {
		dispError(err);
	});
}//RenderMap

function resizeMap(){
	width = $(window).width();
	height = $(window).height()-20;
	
	d3.select('svg')
			.attr('width',width)
			.attr('height',height)
	
	//Define projection
	projection.translate([width / 2, height / 2])
	
	refreshMap();
}

function dispCountryName(d,i){
	d3.select("#tooltip")
			.text(d.properties.name)
			.classed("tooltip",false)
			.classed("tooltipInst",true)
			.style("opacity",1)
			.style("left", (d3.event.pageX + 20) + "px")
			.style("top", (d3.event.pageY - 10) + "px");
}

function dispInstituteName(d,i){
	d3.select("#tooltip")
			.text(d.properties.name+" ("+d.properties.count+")")
			.classed("tooltipInst",false)
			.classed("tooltip",true)
			.style("opacity",1)
			.style("left", (d3.event.pageX - 20) + "px")
			.style("top", (d3.event.pageY + 10) + "px");
	
	$("#"+i).css("fill",highlight_color);
}