

// This is a javascript file

const margin = {top : 90, right : 200, bottom : 25, left : 90},
	width = 1000 - margin.left - margin.right // use window width
	height = 400 - margin.top - margin.bottom // use window height


const parseYear = d3.timeParse("%Y");
const formatYear = d3.timeFormat("%Y");


const xScale = d3.scaleTime().range([0, width]),
		yScale = d3.scaleLinear().range([height, 0]);

d3.csv("state-year-earthquakes.csv")
	.then(function(data) {
		data.forEach(function(d) {
			d.count = +d.count;
		})

	var years = [...new Set(data.map(item => item.year))];
	var regions = [...new Set(data.map(item => item.region))];
	var states = [...new Set(data.map(item => item.state))];

	var newOrder = [];

	for (y in years) {
		newOrder.push({});
		Object.assign(newOrder[y], {"year": years[y]});
		for (r in regions) {
			Object.assign(newOrder[y], {[regions[r]] : (d3.sum(data.filter(function(d) { return d.year == years[y];}).filter(function(e) { return e.region == regions[r]; }), function(f) { return f.count }))})
		}
	}

	xScale.domain(d3.extent(newOrder, function(d) { return parseYear(d.year); }));
	yScale.domain([0, d3.max(newOrder, d => d3.max([d.South, d.Northeast, d.Midwest, d.West]))]);
	
	// console.log(xScale);
	// console.log(yScale);
	// console.log(newOrder);

	const line = d3.line()
		.x(function(d) {
			return xScale(d.year); 
		})
		.y(d => yScale(d.value))
		.curve(d3.curveMonotoneX);

	const svg = d3.select("#chart")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale).ticks(d3.timeYear));

	svg.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(yScale));

	const colors = {
		Midwest: {
			hex: "#FF3633",
			name: "Midwest"
		},

		Northeast: {
			hex: "#3393FF",
			name: "Northeast"
		},

		South: {
			hex: "#2CD341",
			name: "South"
		},
		
		West: {
			hex: "#962CD3",
			name: "West"
		}
	};

	var values = {};

	["Midwest", "Northeast", "South", "West"].forEach(region => {
	  values[region] = newOrder.map(d => {
	    return {
	      // region: region,
	      value: d[region],
	      year: parseYear(d.year)
	    };
	  });
  	});
	// console.log(values);

	["Midwest", "Northeast", "South", "West"].forEach(region => {
	  svg.append("path")
	    .datum(values[region])
	    .attr("class", "line")
	    .attr("d", line)
	    .attr("stroke", colors[region].hex);

      svg.selectAll("g.dot")
	    .data(values[region]).enter()
	    .append("circle")
	      .attr("class", "dot")
	      .attr("d", function (d) { return d.region = region; })
	      .attr("cx", function(d) { return xScale(d.year); })
	      .attr("cy", function(d) { return yScale(d.value); })
	      .attr("r", 5)
	      .attr("fill", function(d) { return colors[region].hex})
	      .on("mouseover", function(d) {
	      	reg = d.region; 
	      	pos = formatYear(xScale.invert(d3.select(this).attr("cx")));
	      	d3.select(this).attr("r", 8);
	      	mouseover(pos, reg);
	      	// mouseover(reg,pos);
	      })
	      .on("mouseout", function(d) {
	      	d3.select(this).attr("r", 5);
	      	mouseout();
	      });
	});



	 
	const legend = svg.append("g")
		.attr("class", "legend")
		.attr("transform", "translate(" + (width + margin.left) + ",10)")
		.style("font-size", "12px");

	Object.keys(colors).forEach((color, i) => {
		legend.append("text")
			.attr("y", `${i}em`)
			.attr("x", "1em")
			.text(colors[color].name);

		legend.append("circle")
			.attr("cy", `${i - 0.25}em`)
			.attr("cx", 0)
			.attr("r", "0.4em")
			.attr("fill", colors[color].hex);
	})
	// console.log(xScale);

	svg.append("text")
		.attr("transform", "translate(90,-25)")
		.attr("align", "center")
		.attr("font-family", "Arial")
		.attr("font-weight", "bold")
		.attr("font-size", "30px")
		.text("US Earthquakes by Region 2011-2015")

	svg.append("text")
		.attr("transform", "translate(275,25)")
		.attr("align", "center")
		.attr("font-family", "Arial")
		.attr("font-size", "16px")
		.attr("font-weight", "bold")
		.attr("fill", "blue")
		.text("twilcox8")




	const subChart = d3.select("#subChart")	
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


function mouseover(year, region) {

	// year = "2012";
	// region = "West"
	var filteredByYear = data.filter(function(d) { return d.year == year; })
	// console.log(filteredByYear);
	var subFilteredByRegion = filteredByYear.filter(function(d) { return d.region == region; });
	
	console.log(subFilteredByRegion);

	var maxX = d3.max([...new Set(subFilteredByRegion.map(item => item.count))]);


	console.log(maxX);
	var scxScale = d3.scaleLinear()
		.range([0,width])
		.domain([0, maxX])
	
	subFilteredByRegion.sort(function(a, b) {
        return a.count - b.count;
      });

	var scyScale = d3.scaleBand()
		.range([height, 0])
		.round(true)
		.domain(subFilteredByRegion.map(function(d) {
			return d.state ;
		}))
		.padding(.1);
	// var sortable = [];


	subChart.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(scyScale));

	// subChart.append("g")
	// 	.attr("class", "grid")
	// 	.call(d3.axisLeft(scyScale).ticks(5));

	var scxAxis = d3.axisBottom()
		.scale(scxScale)
		.tickSizeInner(.45*(-width))
		.tickFormat("");


	subChart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(scxScale));

	subChart.append("g")
		.attr("class", "grid")
		.attr("transform", "translate(0," + height + ")")
		.call(scxAxis);


	var bars = subChart.selectAll(".bar")
		.data(subFilteredByRegion)
		.enter()
		.append("g")

	bars.append("rect")
		.attr("class", "bar")
		.attr("y", function(d) {
			return scyScale(d.state);
		})
		.attr("height", scyScale.bandwidth())
		.attr("x", 0)
		.attr("width", function(d) {
			return scxScale(d.count);
		})
		.attr("fill", "steelblue");

	subChart.append("text")
		.attr("transform", "translate(100,-25)")
		.attr("align", "center")
		.attr("font-family", "Arial")
		.attr("font-weight", "normal")
		.attr("font-size", "28px")
		.text(region+ "ern Region Earthquakes " + year);
	}

	function mouseout() {
		subChart.selectAll("g")
		      .remove();
		subChart.selectAll("text")
			.remove();
	}




});


// ;