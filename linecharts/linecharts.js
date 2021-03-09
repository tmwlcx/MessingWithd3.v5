// Use the margin convention
var margin = {top:90, right:120, bottom:90, left:90}
, width = 1200- margin.left - margin.right // use the window's width
, height = 900 - margin.top - margin.bottom; // use the window's height

function symbolSize(v) { return Math.pow(Math.log(v["EstDeaths"]),2.5) }

const parseYear = d3.timeParse("%Y");

const xScale=d3.scaleTime().range([0, width]),
	yScale3a = d3.scaleLinear().range([height, 0]),
	yScale3c1 = d3.scaleSqrt().range([height, 0]),
	yScale3c2 = d3.scaleLog();


d3.csv("earthquakes.csv").then(function(data) {
	data.forEach(function(d) {
		d["5_5.9"] = +d["5_5.9"];
		d["6_6.9"] = +d["6_6.9"];
		d["7_7.9"] = +d["7_7.9"];
		d["8.0+"] = +d["8.0+"];
		d["Estimated Deaths"] = +d["Estimated Deaths"];
	});

	
	const maxDeaths = d3.max(data, d => d["Estimated Deaths"]);


	xScale.domain(d3.extent(data, function(d) { return parseYear(d.year); }));
	yScale3a.domain([0, d3.max(data, d => d3.max([d["5_5.9"], d["6_6.9"], d["7_7.9"], d["8.0+"]]))]);
	yScale3c1.domain([0, d3.max(data, d => d3.max([d["5_5.9"], d["6_6.9"], d["7_7.9"], d["8.0+"]]))]);
	yScale3c2.clamp(true).domain([.9999999999999999, d3.max(data, d => d3.max([d["5_5.9"], d["6_6.9"], d["7_7.9"], d["8.0+"]]))]).range([height, 0]).nice();


	//now build the first chart!
	const line = d3.line()
		.x(d => xScale(d.year))
		.y(d => yScale3a(d.value))
		.curve(d3.curveMonotoneX);

	const line3c1 = d3.line()
		.x(d => xScale(d.year))
		.y(d => yScale3c1(d.value))
		.curve(d3.curveMonotoneX);

	const line3c2 = d3.line()
		.x(d => xScale(d.year))
		.y(d => yScale3c2(d.value))
		.curve(d3.curveMonotoneX);



	const chart3a = d3.select("#chart3a")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	chart3a.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale).ticks(d3.timeYear.every(2)));

	chart3a.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(yScale3a));
	

	const colors = {
		"5_5.9": {
			hex: "#FFC300",
			name: "5_5.9",
			symbol: d3.symbolCircle
		},

		"6_6.9": {
			hex: "#FF5733",
			name: "6_6.9",
			symbol: d3.symbolTriangle
		},

		"7_7.9": {
			hex: "#C70039",
			name: "7_7.9",
			symbol: d3.symbolDiamond

		},
		
		"8.0+": {
			hex: "#900C3F",
			name: "8.0+",
			symbol: d3.symbolSquare

		}
	};

	d3.keys(colors).forEach(scale => {
		const values = data.map(d => {
			return {
				value: d[scale],
				year: parseYear(d.year)
			};
		});

		chart3a.append("path")
			.datum(values)
			.attr("class", "line")
			.attr("d", line)
			.attr("stroke", colors[scale].hex);

	});

	const legend3a = chart3a.append("g")
		.attr("class", "legend")
		.attr("transform", "translate(" + (1.025 * width) + ",10)")
		.style("font-size", "16px");

	Object.keys(colors).forEach((color, i) => {
		legend3a.append("text")
			.attr("y", `${1.3*i}em`)
			.attr("x", "2.3em")
			.text(colors[color].name);

		legend3a.append("rect")
			.attr("y", `${1.3*i-0.7}em`)
			.attr("x", 0)
			.attr("width", 35)
			.attr("height", 12)
			.attr("fill", colors[color].hex);
	});

	//add x-axis label
	chart3a.append("text")
		.attr("transform", "translate(" + (width / 2) + "," + (height + 40) + ")")
		.style("text-anchor", "middle")
		.attr("font-family", "Segoe")
		.attr("font-size", "20px")
		.text("Year")

	//add y-axis label
	chart3a.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", -50)
		.attr("x", 0 - (height / 2))
		.attr("font-family", "Segoe")
		.attr("font-size", "20px")
		.style("text-anchor", "middle")
		.text("Num of Earthquakes")

	//add title
	chart3a.append("text")
		.attr("x", width/4)
		.attr("y", -15)
		.attr("align", "center")
		.attr("font-size", "30px")
		.attr("font-family", "Segoe")
		.attr("font-weight", "bold")
		.text("Earthquake Statistics for 2000-2015")

	//add caption
	chart3a.append("text")
		.attr("x", 10)
		.attr("y", height + margin.bottom - 25)
		.attr("font-size", "20px")
		.attr("font-family", "Segoe")
		.attr("font-weight", "bold")
		.text("Figure 3a")
	chart3a.append("text")
		.attr("x", 90)
		.attr("y", height + margin.bottom - 25)
		.attr("font-size", "20px")
		.attr("font-family", "Segoe")
		.text(": Example line chart")

	

	//build second chart!!!
	const chart3b = d3.select("#chart3b")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	chart3b.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale).ticks(d3.timeYear.every(2)));

	chart3b.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(yScale3a));

	const symbolScale = d3.scaleLinear().domain([0,100]).range([0, maxDeaths])

	d3.keys(colors).forEach(scale => {
		const values = data.map(d => {
			return {
				value: d[scale],
				year: parseYear(d.year),
				EstDeaths: d["Estimated Deaths"]
			};
		});

		chart3b.append("path")
			.datum(values)
			.attr("class", "line")
			.attr("d", line)
			.attr("stroke", colors[scale].hex);


		values.forEach(function(v) {
			var symbol = d3.symbol().type(colors[scale].symbol).size(symbolSize(v));
			chart3b.append("path")
				.attr("transform", "translate(" + xScale(v.year) + "," + yScale3a(v.value) +")")
				.attr("d", symbol)
				.attr("fill", colors[scale].hex);
		});

	});

	const legend3b = chart3b.append("g")
		.attr("class", "legend")
		.attr("transform", "translate(" + (1.025 * width) + ",10)")
		.style("font-size", "16px");

	Object.keys(colors).forEach((color, i) => {
		legend3b.append("text")
			.attr("y", `${1.3*i}em`)
			.attr("x", "2.3em")
			.text(colors[color].name);

		legend3b.append("rect")
			.attr("y", `${1.3*i-0.7}em`)
			.attr("x", 0)
			.attr("width", 35)
			.attr("height", 12)
			.attr("fill", colors[color].hex);
	});

	//add x-axis label
	chart3b.append("text")
		.attr("transform", "translate(" + (width / 2) + "," + (height + 40) + ")")
		.style("text-anchor", "middle")
		.attr("font-family", "Segoe")
		.attr("font-size", "20px")
		.text("Year")

	//add y-axis label
	chart3b.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", -50)
		.attr("x", 0 - (height / 2))
		.attr("font-family", "Segoe")
		.attr("font-size", "20px")
		.style("text-anchor", "middle")
		.text("Num of Earthquakes")

	//add title
	chart3b.append("text")
		.attr("x", width/4.5)
		.attr("y", -15)
		.attr("align", "center")
		.attr("font-size", "30px")
		.attr("font-family", "Segoe")
		.attr("font-weight", "bold")
		.text("Earthquake Statistics for 2000-2015 with Symbols")

	//add caption
	chart3b.append("text")
		.attr("x", 10)
		.attr("y", height + margin.bottom - 25)
		.attr("font-size", "20px")
		.attr("font-family", "Segoe")
		.attr("font-weight", "bold")
		.text("Figure 3b")
	chart3b.append("text")
		.attr("x", 91)
		.attr("y", height + margin.bottom - 25)
		.attr("font-size", "20px")
		.attr("font-family", "Segoe")
		.text(": Example line chart with symbols")


	//build 3rd chart...
	const chart3c1 = d3.select("#chart3c1")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	chart3c1.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale).ticks(d3.timeYear.every(2)));

	chart3c1.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(yScale3c1));

	// const symbolScale = d3.scaleLinear().domain([0,100]).range([0, maxDeaths])

	d3.keys(colors).forEach(scale => {
		const values = data.map(d => {
			return {
				value: d[scale],
				year: parseYear(d.year),
				EstDeaths: d["Estimated Deaths"]
			};
		});

		chart3c1.append("path")
			.datum(values)
			.attr("class", "line")
			.attr("d", line3c1)
			.attr("stroke", colors[scale].hex);


		values.forEach(function(v) {
			var symbol = d3.symbol().type(colors[scale].symbol).size(symbolSize(v));
			chart3c1.append("path")
				.attr("transform", "translate(" + xScale(v.year) + "," + yScale3c1(v.value) +")")
				.attr("d", symbol)
				.attr("fill", colors[scale].hex);
		});

	});

	const legend3c1 = chart3c1.append("g")
		.attr("class", "legend")
		.attr("transform", "translate(" + (1.025 * width) + ",10)")
		.style("font-size", "16px");

	Object.keys(colors).forEach((color, i) => {
		legend3c1.append("text")
			.attr("y", `${1.3*i}em`)
			.attr("x", "2.3em")
			.text(colors[color].name);

		legend3c1.append("rect")
			.attr("y", `${1.3*i-0.7}em`)
			.attr("x", 0)
			.attr("width", 35)
			.attr("height", 12)
			.attr("fill", colors[color].hex);
	});

	//add x-axis label
	chart3c1.append("text")
		.attr("transform", "translate(" + (width / 2) + "," + (height + 40) + ")")
		.style("text-anchor", "middle")
		.attr("font-family", "Segoe")
		.attr("font-size", "20px")
		.text("Year")

	//add y-axis label
	chart3c1.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", -50)
		.attr("x", 0 - (height / 2))
		.attr("font-family", "Segoe")
		.attr("font-size", "20px")
		.style("text-anchor", "middle")
		.text("Num of Earthquakes")

	//add title
	chart3c1.append("text")
		.attr("x", width/4.5)
		.attr("y", -15)
		.attr("align", "center")
		.attr("font-size", "30px")
		.attr("font-family", "Segoe")
		.attr("font-weight", "bold")
		.text("Earthquake Statistics for 2000-2015 (Square Root Scale)")

	//add caption
	chart3c1.append("text")
		.attr("x", 10)
		.attr("y", height + margin.bottom - 25)
		.attr("font-size", "20px")
		.attr("font-family", "Segoe")
		.attr("font-weight", "bold")
		.text("Figure 3c-1")
	chart3c1.append("text")
		.attr("x", 105)
		.attr("y", height + margin.bottom - 25)
		.attr("font-size", "20px")
		.attr("font-family", "Segoe")
		.text(": Example line chart using square root scale")

	//build last chart...dear god...
	const chart3c2 = d3.select("#chart3c2")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	chart3c2.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale).ticks(d3.timeYear.every(2)));

	chart3c2.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(yScale3c2));


	d3.keys(colors).forEach(scale => {
		const values = data.map(d => {
			return {
				value: d[scale],
				year: parseYear(d.year),
				EstDeaths: d["Estimated Deaths"]
			};
		});

		chart3c2.append("path")
			.datum(values)
			.attr("class", "line")
			.attr("d", line3c2)
			.attr("stroke", colors[scale].hex);


		values.forEach(function(v) {
			var symbol = d3.symbol().type(colors[scale].symbol).size(symbolSize(v));
			chart3c2.append("path")
				.attr("transform", "translate(" + xScale(v.year) + "," + yScale3c2(v.value) +")")
				.attr("d", symbol)
				.attr("fill", colors[scale].hex);
		});

	});

	const legend3c2 = chart3c2.append("g")
		.attr("class", "legend")
		.attr("transform", "translate(" + (1.025 * width) + ",10)")
		.style("font-size", "16px");

	Object.keys(colors).forEach((color, i) => {
		legend3c2.append("text")
			.attr("y", `${1.3*i}em`)
			.attr("x", "2.3em")
			.text(colors[color].name);

		legend3c2.append("rect")
			.attr("y", `${1.3*i-0.7}em`)
			.attr("x", 0)
			.attr("width", 35)
			.attr("height", 12)
			.attr("fill", colors[color].hex);
	});

	//add x-axis label
	chart3c2.append("text")
		.attr("transform", "translate(" + (width / 2) + "," + (height + 40) + ")")
		.style("text-anchor", "middle")
		.attr("font-family", "Segoe")
		.attr("font-size", "20px")
		.text("Year")

	//add y-axis label
	chart3c2.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", -50)
		.attr("x", 0 - (height / 2))
		.attr("font-family", "Segoe")
		.attr("font-size", "20px")
		.style("text-anchor", "middle")
		.text("Num of Earthquakes")

	//add title
	chart3c2.append("text")
		.attr("x", width/4.5)
		.attr("y", -15)
		.attr("align", "center")
		.attr("font-size", "30px")
		.attr("font-family", "Segoe")
		.attr("font-weight", "bold")
		.text("Earthquake Statistics for 2000-2015 (Log Scale)")

	//add caption
	chart3c2.append("text")
		.attr("x", 10)
		.attr("y", height + margin.bottom - 25)
		.attr("font-size", "20px")
		.attr("font-family", "Segoe")
		.attr("font-weight", "bold")
		.text("Figure 3c-2")
	chart3c2.append("text")
		.attr("x", 105)
		.attr("y", height + margin.bottom - 25)
		.attr("font-size", "20px")
		.attr("font-family", "Segoe")
		.text(": Example line chart using log scale")


	//finally, add username and be done with this madness
	chart3c2.append("text")
		.attr("x", width - 25)
		.attr("y", height + margin.bottom - 45)
		.attr("font-size", "15px")
		.attr("font-family", "Segoe")
		.text("twilcox8")
});


