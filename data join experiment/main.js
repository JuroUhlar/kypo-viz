


var originalDataset = []
var filteredDataset = []

var players = [];
var startTimes = [];


// *************************************************************
// VARIABLES FOR WINDOWS SIZES, BORDERS AND SUCH SVG STUFF 

var xScale;
var yScale;

var width = window.innerWidth - 40; // Dynamically set width to make sure diagram always fits on page
var height = window.innerHeight - 120; // Dynamically set height
var padding_horizontal = 20;
var extra_left_padding = 40;
var padding_vertical = 20;

var color = d3.scaleOrdinal(d3.schemeCategory20).domain(d3.range(1,21)); // Color palette generator, give it a number, it gives you a color 


// ****************************************************************
// VARIABLES FOR KEEPING TRACK OF CURRENTLY SELECTED LEVEL

var activeLevels = "all";
var activeLevelElements = []



// ****************************************************************
// CREATE SVG
var svg = d3.select('#chart')
            .append("svg")
            .attr("height", height)
            .attr("width", width);


// ****************************************************************
// FUNCTIONS FOR FILTERING BASED ON SELECTED LEVEL 
// ****************************************************************


// show only events of this one level, 
// specify "shift" as a boolean value: true - shift events to logical time, false or undefined - keep them where they are
function showOnlyLevel(level, shift) {
	//****clean up the selection before
	hideAll();   // hide everything
	shiftToGameTime(activeLevelElements); // shift previously selected level back to game time 

	activeLevels = level;  // event filtering now only effects this one level
	activeLevelElements = [];

	for(var i = 0; i < allThings.length; i++){ // just the elements of the specified level into array
                for(var j = 0; j < allThings[i].length; j++) {
                    if (allThings[i][j].__data__.level == level) {   // use == comparison to first convert types, then compare
                    	activeLevelElements.push(allThings[i][j]);		// add level elements to array
                    	}
                }      
     }

    toggleThings(activeLevelElements); // activate active level elements

    for (var i = 0; i < toggles.length; i++) {  // all toggles on, but they only effect this one level
                toggles[i].checked = true;
            }

    if(shift === true) {   // shift level to logical time if specified, if not, leave it or put it back into game time
    	shiftToLogicalTime(activeLevelElements);
    } else {
    	shiftToGameTime(activeLevelElements);
    }
}


// Shift all things in the giver array from their original position (game time), to position with level starting at 00:00 (logical/level time)
function shiftToLogicalTime(things) {
	var length = things.length;
	for(var i = 0; i<length; i++) {
		var logicalShift =  xScale(things[i].__data__.game_seconds) -
                        	xScale(strTimeToSeconds(things[i].__data__.logical_time));
    	logicalShift = Math.round(logicalShift);
    	if (logicalShift < 0) { // when times don't make sense, print error and skip event
    		console.log("Player " + players.indexOf(things[i].__data__.ID) + ": Enexpected logical time shift, underlying data probably does not make sense (several game starts, time event inconsistensies etc...)");
    		continue;
    	}
        logicalShift = "translate(-" + logicalShift + ")";
        things[i].setAttribute("transform", logicalShift);
	}

}

// Shift all elements in a given array back to game time
function shiftToGameTime(things) {
	var length = things.length;
	for(var i = 0; i<length; i++) {
		things[i].setAttribute("transform", "");
	}		
}


function showAllLevels() {
    shiftToGameTime(activeLevelElements);
    activeLevelElements = [];
	activeLevels = "all";
	showAll();
}

// (GUI) DROPDOWN MENU CHANGE EVENT HANDLER
function selectLevel(value){
	if(value === "all") {
		showAllLevels();
	}  else {
		var level = +value[0];
		var shift = (value.indexOf("shift") != -1);
		showOnlyLevel(level, shift);
	}
}





//**************************************************
// FUNCTIOONs TO HELP WITH TIMES PARSING AND CONVERSIONS, nasty stuff

function strDateToTime(snippet){
    var time = snippet.slice(11,19);
    return time;
}

function strTimeToSeconds(snippet) {
    var parsedTime = snippet.match(/[0-9][0-9]/g);
    if (parsedTime.length === 3) {
        return (+parsedTime[0] * 3600) + (+parsedTime[1] * 60) + (+parsedTime[2]);
    } else if (parsedTime.length === 2) {
        return (+parsedTime[0] * 3600) + (+parsedTime[1] * 60);
    } else if (parsedTime.length === 1) {
        return (+snippet[0] * 3600) + (+parsedTime[0] * 60);
    } else {
        console.log("unexpected date time format!");
        return 0;
    }
    
}

function getSeconds(snippet) {
    return strTimeToSeconds(strDateToTime(snippet));
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}


// **********************************************************************
// PAGE LOAD RESET 
// On page the load, all the event visual elements are drawn, so make all boxes CHECKED to make sure they are in sync with the visuals
window.onload = function () { 
    // // for (var i = 0; i < toggles.length; i++) {
    // //     toggles[i].checked = true;
    // // }


    // var xAxis = document.getElementById("xAxis"); //Had to place this here, probably to make sure the axis is already created when i call it;
    // var yAxis = document.getElementById("yAxis"); 

    // var xAxisToggle = document.getElementById("xAxisToggle")  // Show x axis, hide y axis
    //                 .checked = true;
    // var yAxisToggle = document.getElementById("yAxisToggle")
    //                 .checked = false;

    var cb = d3.selectAll(".event-toggle");
    console.log(cb);
    cb.property("checked", true);


}




//*************************************************************************
//*************************************************************************
//************************ MAIN RENDERING FUNCTION ************************

    function renderData(dataset) {
        refreshData(dataset);
    }



//**********************************************
// Function for programmatically generate dropdown menu for selecting levels
// (The accommodate variable number of levels for each dataset)
function generateLevelDropdownMenu(dataset) {
	
	var numberOfLevels = 0;
	dataset.forEach(function (d) { // get the number of highest level ( = n of levels)
		if(d.level > numberOfLevels) {
			numberOfLevels = d.level;
		}
	});

	//remove previously generated dropdown menu
	d3.select("#selectLevelDropDown").remove();


	d3.select("#UIrow2") //In the apprioarate div, create a select tag
		.append("select")
		.attr("id", "selectLevelDropDown")
		.on("change", onLevelSelectChange);

	var selectTag = d3.select("#selectLevelDropDown");

	selectTag.append("option")  // add option for all levels
				 .text("Show all levels")
				 .attr("value", "all");
 
	for(var i = 0; i<numberOfLevels; i++) { //for each level add 2 options (in game and logical time)
		selectTag.append("option")
				 .text("Show level " + (i+1))
				 .attr("value", i+1);

		selectTag.append("option")
				 .text("Show level " + (i+1) + " - logical time")
				 .attr("value", (i+1) + ", shift");				 
	}	

	selectTag.value = "all";
	return numberOfLevels;
}


function onLevelSelectChange() {
	selectValue = d3.select('#selectLevelDropDown').property('value');
	selectLevel(selectValue);
}

// ***************
// on filter change
d3.selectAll(".event-toggle").on("change", function () { 

        var type = this.value; // Get value of checkbox to find out which checkbox was clicked
        console.log(type);
        console.log(this.checked);

        if (this.checked) { // adding data points 
            var newEvents = originalDataset.filter(function(d){
               return d.event.indexOf(type) != -1;
            });
            filteredDataset = filteredDataset.concat(newEvents);
        } else {
            filteredDataset = filteredDataset.filter(function(d){ 
                return d.event.indexOf(type) === -1;
            });
        }

        refreshData(filteredDataset);
    });




function prepareData() {
    // initialize start time to -1 so you can check if start time has already been recorded
    for(var i=0; i<50; i++) { startTimes[i] = -1;}

    // Construct and array of all players, to later identify them with indexes
    originalDataset.forEach(function (d) {
        if(players.indexOf(d.ID) === -1){
            players.push(d.ID); 
        }
    });

    // Construct an array of start times per player, to later use to calculate game time for each event
    originalDataset.forEach(function (d){
        if(d.event === "Game started"){
            // startTimes[players.indexOf(d.ID)] = getSeconds(d.timestamp); 
            if (startTimes[players.indexOf(d.ID)] === -1) {
                startTimes[players.indexOf(d.ID)] = getSeconds(d.timestamp);
            } else {
                startTimes[players.indexOf(d.ID)] =
                 // Math.min(getSeconds(d.timestamp), startTimes[players.indexOf(d.ID)]);  // if there are two or more game-starts, use the earliest one
                 86000;  // if there are two or more game start for a player, set game start to end of day and do not visualize this player data
                 console.log("Unexpected data: Player " + players.indexOf(d.ID) + " started the game more than once. His data will not be visualized.");
            }
            
        }
    });


    // Give each event object a new property - timestamp relative to the start of their game 
    // This proporty is used to calculate their X position in the diagram
    originalDataset.forEach(function (d) {
        d.game_seconds = getSeconds(d.timestamp) - startTimes[players.indexOf(d.ID)];
        // console.log(d.game_seconds);
    });

}



function generateScalesAndAxis() {
    //*********** SCALES **********************
    xScale = d3.scaleLinear()
                             .domain([0, d3.max(originalDataset, function(d) { return d.game_seconds; })]) // X domain boundury defined by the latest event
                             .range([padding_horizontal + extra_left_padding, width - padding_horizontal]); // set by dimensions of SVG - padding

    yScale = d3.scaleLinear() // accept players index in array
                             .domain([0, players.length])    // Y domain boundaty defined by number of players
                             .range([padding_vertical, height - padding_vertical]); // set by dimensions of SVG - padding

    //************AXIS ******************************
    var xAxis = d3.axisBottom()
            .scale(xScale)
            .tickValues(d3.range(0,xScale.domain()[1],900)) // Make ticks every 15 minutes (900 seconds), from 0 to latest event - upper bound of xScale domain
            .tickFormat(d3.format("d")); //remove "," from format to make it easier to convert to HH:MM:SS  
   
    //Generate X axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, " + (height - padding_vertical) + ")")
        .attr("id", "xAxis")
        .call(xAxis);

        
    // Reformat X axis TICKS to show time in readable format    
    var ticks = document.getElementsByClassName("tick");
    for(var i = 0; i<ticks.length; i++) {
       ticks[i].childNodes[1].textContent = ticks[i].childNodes[1].textContent.toHHMMSS().slice(0,5)+"h";
    }

    // Generate Y Axis 
    var playerLabels = svg.append("g")
                    .attr("class", "axis")
                    .attr("id", "yAxis");
                    // .attr("style", "display: none");

    players.forEach(function (d,i) {
        playerLabels.append("text")
            .text(function () {
                return "Player " + i;
            })
        .attr("y", function () {
            return yScale(i) + 4;
        })
        .attr("x", "0")
        .attr("class", "player-label");
    });

}

function refreshData(dataset) {

    // console.log("Refresh started!");
     //***********************************************
            // LINES CERRESPONDING TO DURATION OF EACH LEVEL 
            var lines = svg.selectAll(".level-line")
                .data(dataset.filter(function (d) { // get only events that mean end of level
                   return d.event === "Correct flag submited" || d.event === "Game finished" || 
                          d.event === "Level cowardly skipped" || d.event === "Game exited prematurely"; 
                }), function (d) {
                    return d.ID + d.game_seconds + d.event;
                });

                    
            lines.enter()
                .append("line")
                .attr("y1", function (d) { // Y coordinate set according to player index
                    return yScale(players.indexOf(d.ID));
                })
                .attr("y2", function (d) { // Y coordinate set according to player index, again
                    return yScale(players.indexOf(d.ID));
                })
                .attr("x2", function (d) { // X coordinate set by game time
                    return xScale(d.game_seconds);
                })
                .attr("x1", function (d,i) { // X coodinate of first point set by game time of previous end-of-level event
                    var currentLevel = d.level;
                    var currentPlayer = d.ID;
                    var levelStart = originalDataset.filter(function (d) { // This craziness figures out what that event is (where this level starts)
                        return (d.ID === currentPlayer) &&
                               (
                                    (+d.level === +currentLevel - 1 &&
                                            (d.event === "Correct flag submited" ||
                                             d.event === "Level cowardly skipped"))
                                    || 
                                    (currentLevel === "1" && d.event === "Game started")
                                );
                    })[0];
                    // console.log(levelStart);
                    return xScale(levelStart.game_seconds);
                })
                .attr("stroke-width", "0")
                .attr("class", "level-line")
                .attr("stroke", function (d){
                    return color(d.level); // colour based on level
                })
                .transition()
                .duration(500)
                .attr("stroke-width", "3")
                .delay(function (d,i) {
                    return i * 5;
                });

                lines.exit().transition()
                            .duration(300)
                            .attr("stroke-width", "0")
                            .remove();

            //************************************************    
            // CIRCLES CORRESPONDING TO ALL GAME EVENTS

                var circles =  svg.selectAll("circle")
                                  .data(dataset, function (d) { return d.ID + d.game_seconds +d.event;});

                var enteringCircles = circles.enter()
                                             .append("circle");

                enteringCircles.attr("cx", function (d) {
                        return xScale(d.game_seconds);
                    })
                    .attr("cy", function (d) {
                        // return Math.random() * height;
                        return yScale(players.indexOf(d.ID));
                    })
                    .attr("fill", function  (d){
                        if(d.event.indexOf("Wrong flag submited") != -1 ||
                            d.event == "Game exited prematurely") {
                            return "red";
                        } else if (d.event === "Level cowardly skipped") {
                            return "black";
                        } else {
                            return color(d.level);
                        }                           
                        // return (d.event.indexOf("Wrong flag submited") != -1) ? "red" : color(d.level);
                        // return color(d.level);    
                    })
                    .attr("class", function (d){
                        if (d.event === "Game exited prematurely") {
                            return "premature-exit";
                        } else if (d.event === "Level cowardly skipped") {
                            return "level-skip";
                        } else if (d.event === "Correct flag submited") {
                            return "correct-flag";
                        } else if (d.event === "Game finished") {
                            return "game-finished";
                        } else if (d.event === "Game started") {
                            return "game-started";
                        } else if (d.event.indexOf("Hint") != -1 ) {
                            return "hint";
                        } else if (d.event.indexOf("Wrong flag submited") != -1 ) {
                            return "wrong-flag";
                        }  else if (d.event.indexOf("Help level") != -1 || d.event.indexOf("help level") != -1) {
                            return "help-level";
                        }  else return ""; 
                    })
                    .attr("stroke-width", "1")
                    .attr("stroke", "grey")
                    // .attr("opacity", "0.5")
                    .append("title")
                    .text(function (d) {
                        return  "Event: " + d.event + "\n" +
                                "Player " + players.indexOf(d.ID) + " (" + d.ID + ") \n" + 
                                "Level: " + d.level + "\n" +
                                "Level time: " + d.logical_time + "\n" + 
                                "Game time: " + (d.game_seconds+"").toHHMMSS();  
                    });

                    enteringCircles.attr("r", "0")
                            .transition()
                            .attr("r", function (d) {
                                if (d.event === "Correct flag submited" || 
                                    d.event === "Game finished" ||
                                    d.event === "Game exited prematurely") {
                                    return 7; 
                                } else {
                                    return 5;
                                }
                            })
                            .duration(20)
                            .delay(function (d,i) {
                                return i;
                            });

                    circles.exit().transition()
                                    .duration(300)
                                    .attr("r", "0")
                                    .remove();

                    // console.log("Refresh finished");

}