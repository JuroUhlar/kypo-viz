

var activeLevels = "all";
var activeLevelElements = []


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
                        	xScale(StrTimeToSeconds(things[i].__data__.logical_time));
    	logicalShift = Math.round(logicalShift);
    	if (logicalShift < 0) {
    		console.log("Enexpected logical time shift, underlying data probably does not make sense (several game starts, time event inconsistensies etc...)");
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

function selectLevel(value){
	if(value === "all") {
		showAllLevels();
	}  else {
		var level = +value[0];
		var shift = (value.indexOf("shift") != -1);
		showOnlyLevel(level, shift);
	}
}




// TOGGLE FUNCTIONS
        // TO-DO Refactor the other way around
        function toggleThings(things){ 
            for (var i = 0; i< things.length; i++) {
             	if(things[i].__data__.level == activeLevels || activeLevels === "all") {
             		 if (things[i].style.display != "none") {
                        things[i].style.display = "none";
                    } else {
                        things[i].style.display = "block";
                    }
             	}
                   
            }
        }

        function toggleThis(thing) {
            if (thing.style.display != "none") {
                        thing.style.display = "none";
                    } else {
                        thing.style.display = "block";
                    }
        }


 // FUNCTIONS THAT SHOW/HIDE ALL ELEMENTS AND UPDATE CHECKBOXES
        // TO-DO: Refactor into one method
        function hideAll() {
            for(var i = 0; i < allThings.length; i++){
                for(var j = 0; j < allThings[i].length; j++) {
                	if(allThings[i][j].__data__.level == activeLevels || activeLevels === "all"){ // added condition for filtering based on currently active levels
                		allThings[i][j].style.display = "none";
                	}
                }
            }
            for (var i = 0; i < toggles.length; i++) {
                toggles[i].checked = false;
            }
            return;
        }

        function showAll() {
            for(var i = 0; i < allThings.length; i++){
                for(var j = 0; j < allThings[i].length; j++) {
                    if(allThings[i][j].__data__.level == activeLevels || activeLevels === "all"){ // added condition for filtering based on currently active levels
                		allThings[i][j].style.display = "block";
                	}
                }
            }
            for (var i = 0; i < toggles.length; i++) {
                toggles[i].checked = true;
            }
            return;
        }


// On page the load, all the event visual elements are drawn, so make all boxes CHECKED to make sure they are in sync with the visuals
        window.onload = function () { 
            for (var i = 0; i < toggles.length; i++) {
                toggles[i].checked = true;
            }

            document.getElementById("selectLevelDropDown").value = "all"

            var xAxis = document.getElementById("xAxis"); //Had to place this here, probably to make sure the axis is already created when i call it;
            var yAxis = document.getElementById("yAxis"); 

            var xAxisToggle = document.getElementById("xAxisToggle")  // Show x axis, hide y axis
                            .checked = true;
            var yAxisToggle = document.getElementById("yAxisToggle")
                            .checked = false;

        }