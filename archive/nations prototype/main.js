



var year_idx = 29;

d3.json("nations.json", function(nations){

	// console.log(nations);

	var chart_area = d3.select("#chart_area");

	var frame = chart_area.append("svg");

	// Create canvas inside frame.
	var canvas = frame.append("g");

	// Set margins, width, and height.
	var margin = {top: 21.5, right: 21.5, bottom: 21.5, left: 39.5};
	var frame_width = 960;
	var frame_height = 350;
	var canvas_width = frame_width - margin.left - margin.right;
	var canvas_height = frame_height - margin.top - margin.bottom;

	// Set frame attributes width and height.
	frame.attr("width", frame_width);
	frame.attr("height", frame_height);

	// Shift the canvas and make it slightly smaller than the svg canvas.
	canvas.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Create a logarithmic scale for the income 
	var xScale = d3.scaleLog(); // income
	xScale.domain([300, 1e5]); // set minimum and maximum value
	xScale.range([0, canvas_width]); // set minimum and maximum range on the page

	var yScale = d3.scaleLinear(); // income
	yScale.domain([10, 85]); // set minimum and maximum value
	yScale.range([canvas_height, 0]); // set minimum and maximum range on the page

	var rScale =  d3.scaleSqrt().domain([0, 5e8]).range([1, 40]);

	var colourScale = d3.scaleOrdinal(d3.schemeCategory10);



	// Creating the x & y axes.
	var xAxis = d3.axisBottom()
				  .scale(xScale);

    var yAxis = d3.axisLeft()
				  .scale(yScale);


	// Add the x-axis.
	canvas.append("g")
	  	  .attr("class", "x axis")
	      .attr("transform", "translate(0," + canvas_height + ")")
		  .call(xAxis);

	canvas.append("g")
	  	  .attr("class", "y axis")
	      // .attr("transform", "translate(0," + canvas_height + ")")
		  .call(yAxis);

	var data_canvas = canvas.append("g")
	  .attr("class", "data_canvas");

	var filtered_nations = nations.map(function(nation) { return nation; });
	     
	refreshData(); 



	// Add event listener function to all region checkboxes
	d3.selectAll(".region_cb").on("change", function () { 

		var type = this.value; // Get value of checkbox to find out which ceckbox was clicked

		if (this.checked) { // adding data points 
			var new_nations = nations.filter(function(nation){
			   return nation.region == type;
			});
			filtered_nations = filtered_nations.concat(new_nations);
		} else {
			filtered_nations = filtered_nations.filter(function(nation){ return nation.region != type;});
		}

		refreshData();


	});




	 function refreshData() {
		var dot = data_canvas.selectAll(".dot")
		  .data(filtered_nations, function(d){return d.name}); //what the hell does this function do??
		 // We are also inserting what is called a key function .data(nations, function(d){return d.name});
		 // This function will help D3 keep track of the data when we start changing it
		 // (and the order of the objects). It's important to keep the identifier unique,
		 // which is why we return only the name of the current element.

		var circles = dot.enter().append("circle");

		// create new bubbles
		circles.attr("class","dot")
			  .attr("cx", function(d) { 
			  	return xScale(d.income[year_idx]);
			  	 }) 
			  .attr("cy", function(d) { 
			  	return yScale(d.lifeExpectancy[year_idx]); 
			  	 })
			  .attr("r", "0")
			  .attr("fill", function (d) {
		  		return colourScale(d.region); 
			  })
			  .attr("stroke-width", "1")
			  .attr("stroke", "black")
			  .append("title")
			  .text(function (d) {
			  	return d.name;
			  });

		// move in (pop in) filtered in bubbles (all at the beginning)
		circles.transition()
		  		 .attr("r", function (d) { 
			  	return rScale(d.population[year_idx]);
			  	 });


		// shrink out filtered out bubbles  		 
	  	dot.exit().transition()
    				.attr("r", 0)
    				.remove();



    	// seamlessly update position nad r (populaiton) of bubbles when slider changes year
		dot.transition().ease(d3.easeLinear).duration(200)
			.attr("cx", function(d) { return xScale(d.income[year_idx]); }) // this is why attr knows to work with the data
			.attr("cy", function(d) { return yScale(d.lifeExpectancy[year_idx]); })
			.attr("r", function(d) { return rScale(d.population[year_idx]); });

		// smaller bubbles on tom	
		data_canvas.selectAll(".dot")
			.sort(function (a, b) { return b.population[year_idx] - a.population[year_idx]; });


	}

// when slider is moved
d3.select("#year_slider").on("input", function () {
    year_idx = parseInt(this.value) - 1950;
    refreshData();
});
	


});

// reset checkboxes and slider on load
window.onload = function () {
	var cbs = d3.selectAll(".region_cb");
		cbs.property("checked", true);

	d3.select("#year_slider").property("value", 1979);
}


// TO-DO
// fix horizontal scale, bubbles are going of the chart on the left




