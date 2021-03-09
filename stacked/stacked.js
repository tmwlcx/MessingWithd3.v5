const parseYear = d3.timeParse("%Y")
var colors = ["#b33040", "#d25c4d", "#f2b447"];


d3.csv("earthquake.csv").then(function(csv) {

	var keys = csv.columns.slice(2);

	var year = [...new Set(csv.map(d => d.Year))],
	 	states = [...new Set(csv.map(d => d.State))];

 	var options = d3.select("#year")
 		.selectAll("option")
 		.data(year)
 		.enter()
 		.append("option")
 		.text(d => d);

	var svg = d3.select("#chart"),
		margin = {top : 100, right : 0, bottom : 25, left : 65},
		width = +svg.attr("width") - margin.left - margin.right,
		height = +svg.attr("height") - margin.top - margin.bottom;

	var xScale = d3.scaleBand()
		.range([margin.left, width - margin.right])
		.padding(0.1);

	var yScale = d3.scaleLinear()
		.rangeRound([height - margin.bottom, margin.top]);

	var xAxis = svg.append("g")
		.attr("transform", `translate(0, ${height - margin.bottom})`)
		.attr("class", "x-axis");

	var yAxis = svg.append("g")
		.attr("transform", `translate(${margin.left},0)`)
		.attr("class", "y-axis");


	var zScale = d3.scaleOrdinal()
		.range(["#b33040", "#d25c4d", "#f2b447"])
		.domain(keys);

	update(d3.select("#year").property("value"), 0);

	function update(input, speed) {
		var data = csv.filter(f => f.Year == input);
		data.forEach(d => {
			d.total = d3.sum(keys, k => d[k]);
			return d;
		});

			yScale.domain([0, d3.max(data, d => d3.sum(keys, k => +d[k]))]).nice();

			svg.selectAll(".y-axis")
				.transition()
				.duration(speed)
				.call(d3.axisLeft(yScale).ticks(null, "s"));

			xScale.domain(data.map(d => d.State));

			svg.selectAll(".x-axis")
				.transition()
				.duration(speed)
				.call(d3.axisBottom(xScale).tickSizeOuter(0));

			var group = svg.selectAll("g.layer")
				.data(d3.stack().keys(keys)(data), d => d.key);

			group.exit()
				.remove();

			group.enter()
				.append("g")
				.classed("layer", true)
				.attr("fill", d => zScale(d.key));

			var bars = svg.selectAll("g.layer").selectAll("rect")
				.data(d => d, e => e.data.State);

			bars.exit()
				.remove()

			bars.enter()
				.append("rect")
				.attr("width", xScale.bandwidth())
				.merge(bars)
			  .transition()
				.duration(speed)
				.attr("x", d => xScale(d.data.State))
				.attr("y", d => yScale(d[1]))
				.attr("height", d => yScale(d[0]) - yScale(d[1]));

			var text = svg.selectAll(".text")
				.data(data, d => d.State);

			text.exit()
				.remove();

			text.enter()
				.append("text")
				.attr("class", "text")
				.attr("text-anchor", "middle")
				.merge(text)
			  .transition()
			  	.duration(speed)
			  	.attr("x", d => xScale(d.State) + xScale.bandwidth() / 2)
			  	.attr("y", d => yScale(d.total) - 5)
			  	.text(d => d.total);

			const legend = svg.append("g")
				.attr("class", "legend")
				.attr("transform", `translate(${width - margin.left}, 60)`)
				.style("font-size", "12px")
				.attr("font-family", "Arial");

			colors.forEach((color, i) => {
				legend.append("text")
					.attr("y", `${i}em`)
					.attr("x", "1em")
					.text(keys[i]);

				legend.append("circle")
					.attr("cy", `${i - 0.25}em`)
					.attr("cx", 0)
					.attr("r", "0.4em")
					.attr("fill", color);
			});
	};



	var select = d3.select("#year")
		.on("change", function() {
			update(this.value, 2000)
		});

//add x-axis label
	svg.append("text")
		.attr("transform", "translate(" + ((width + margin.left) / 2) + "," + (height + 10) + ")")
		.style("text-anchor", "middle")
		.attr("font-family", "Arial")
		.attr("font-size", "14px")
		.text("State")

	//add y-axis label
	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 20)
		.attr("x", 0 - (height / 2))
		.attr("font-family", "Arial")
		.attr("font-size", "14px")
		.style("text-anchor", "middle")
		.text("Number of Earthquakes")

	//add title
	svg.append("text")
		.attr("x", width/3)
		.attr("y", 45)
		.attr("align", "center")
		.attr("font-size", "18px")
		.attr("font-family", "Arial")
		.attr("font-weight", "bold")
		.text("Visualizing Earthquake Counts by State")

	//add caption
	svg.append("text")
		.attr("x", width/3+20)
		.attr("y", height + (1.5* margin.bottom))
		.attr("font-size", "15px")
		.attr("font-family", "Arial")
		.attr("font-weight", "bold")
		.text("Figure 5")
	svg.append("text")
		.attr("x", width/3 + 78)
		.attr("y", height + (1.5 * margin.bottom))
		.attr("font-size", "15px")
		.attr("font-family", "Arial")
		.text(": example stacked bar plot")


	//finally, add username and be done with this madness
	svg.append("text")
		.attr("x", width -margin.left)
		.attr("y", height + margin.bottom )
		.attr("font-size", "15px")
		.attr("font-weight", "bold")
		.attr("font-family", "Arial")
		.text("twilcox8")
});
