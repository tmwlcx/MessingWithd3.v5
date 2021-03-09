var years = [2010, 2011, 2012, 2013, 2014, 2015];
var years_idx = [0,1,2,3,4,5];
var year = 2010;
var idx = years.indexOf(year);
var numFormat = d3.format("d");

// Step
var sliderStep = d3
  .sliderBottom()
  .min(d3.min(years))
  .max(d3.max(years))
  .width(300)
  .tickFormat(d3.format("d"))
  .ticks(5)
  .step(1)
  .default(years[years_idx[0]]);

var gStep = d3
  .select('div#slider-step')
  .append('svg')
  .attr('width', 500)
  .attr('height', 100)
  .append('g')
  .attr('transform', 'translate(120,30)');	

gStep.call(sliderStep);

d3.select("div#slider-step")
	.select("svg")
	.append("text")
	.attr("transform", "translate(35,45)")
	.attr("font-size", "24px")
	.text("Year");

var tip = d3.tip()
	.attr("class", "d3-tip")
	.offset([-5,0])
	.html(function(d) {
		var stateName = d.properties.name;
		var regionName = regions.get(d.properties.name);
		var tipYear = years[idx];
		var quakeNum = earthquakes[idx].get(d.properties.name);
		return "State: " + stateName + "<br>" 
		+ "Region: " + regionName + "<br>"
		+ "Year: " + tipYear + "<br>" 
		+ "Earthquakes: " + quakeNum ;
	})

var cMap = d3.select("#cMap"),
	margin = {top : 50, right : 50, bottom : 50, left : 50},
	width = +cMap.attr("width") - margin.left - margin.right,
	height = +cMap.attr("height"); - margin.top - margin.bottom;

cMap.call(tip);

var year2010 = d3.map(),
	year2011 = d3.map(),
	year2012 = d3.map(),
	year2013 = d3.map(),
	year2014 = d3.map(),
	year2015 = d3.map(),
	regions = d3.map();

var path = d3.geoPath();

var earthquakes = [];

var projection = d3.geoAlbersUsa()
	.translate([width / 2, height / 2]);

var promises = [
  d3.json("states-10m.json"),
  d3.csv("state-earthquakes.csv", function(d) { 
  	year2010.set(d.id = d.States, eNum = (+d["2010"])); 
  	year2011.set(d.id = d.States, eNum = (+d["2011"])); 
  	year2012.set(d.id = d.States, eNum = (+d["2012"])); 
  	year2013.set(d.id = d.States, eNum = (+d["2013"])); 
  	year2014.set(d.id = d.States, eNum = (+d["2014"])); 
  	year2015.set(d.id = d.States, eNum = (+d["2015"]));
  	regions.set(d.States, d.Region);
  }) 
];

Promise.all(promises).then(ready)

function ready([usa]) {
	earthquakes = [year2010, year2011, year2012, year2013, year2014, year2015];
	var states = topojson.feature(usa, usa.objects.states).features;

	colorArr = [ "#fff5eb", "#fee6ce", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#a63603", "#7f2704" ]
	
	var colorLog = d3.scaleLog()
		.domain([1, d3.max(Object.keys( earthquakes[idx] ).map(function ( key ) { return earthquakes[idx][key]; }))])
		.range([0,7]);

	cMap.selectAll("path.states")
		.data(states)
		.enter()
		.append("path")
		.attr("class", "states")
		.attr("d", path.projection(projection))
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide)
		.attr("fill", function(d) {
			d.eNum = earthquakes[idx].get(d.properties.name);
			if (d.eNum == 0) {
				return "#fff5eb";
			} else {
			return colorArr[Math.floor(colorLog(d.eNum+.0001))+1];
			}

		});

	const legend = cMap.append("g")
		.attr("class", "legend")
		.attr("transform", "translate(" + (width) + ",100)")
		.style("font-size", "16px");

	legend.append("text")
		.attr("transform", "translate(-60,-35)")
		.attr("font-weight", "bold")
		.attr("font-size", "16px")
		.text("Earthquake Frequency");

	colorArr.forEach((color, i) => {
		legend.append("text")
			.attr("y", `${1.3*i}em`)
			.attr("x", "1em")
			.text(function(t) { return Math.floor(colorLog.invert(d3.quantile(colorLog.range(), i/8)))-1; });

		legend.append("rect")
			.attr("y", `${1.3*i-0.7}em`)
			.attr("x", 0)
			.attr("width", 12)
			.attr("height", 12)
			.attr("fill", colorArr[i+1]);
	});

	sliderStep.on('onchange', val => {
		year = val;
		idx = years.indexOf(year);

		maxQ = d3.max(Object.keys( earthquakes[idx] ).map(function ( key ) { return earthquakes[idx][key]; }));
		var colorLog = d3.scaleLog()
			.domain([1, maxQ])
			.range([0,7]);

		cMap.selectAll("path.states")
			.data(states)
			.attr("fill", function(d) {
				d.eNum = earthquakes[idx].get(d.properties.name);
				if (d.eNum == 0) {
					return "#fff5eb";
				} else {
				return colorArr[Math.floor(colorLog(d.eNum+.0001))+1];
				}

			});

		legend.selectAll("text")
			.remove();
		legend.selectAll("rect")
			.remove();

		legend.append("text")
			.attr("transform", "translate(-50,-35)")
			.attr("font-weight", "28px")
			.text("Earthquake Frequency");

		colorArr.forEach((color, i) => {
			legend.append("text")
				.attr("y", `${1.3*i}em`)
				.attr("x", "1em")
				.text(function(t) { return Math.floor(colorLog.invert(d3.quantile(colorLog.range(), i/8)))-1; });

			legend.append("rect")
				.attr("y", `${1.3*i-0.7}em`)
				.attr("x", 0)
				.attr("width", 12)
				.attr("height", 12)
				.attr("fill", color);
		});

	});

cMap.append("text")
		.attr("x", width - 75)
		.attr("y", height)
		.attr("font-size", "15px")
		.attr("font-family", "Segoe")
		.attr("font-weight", "bold")
		.text("twilcox8")

}

