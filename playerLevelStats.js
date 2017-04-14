

var originalDataset = require("./all-events.json");
// var originalDataset = require("./all-events.json");


var players = [];
var startTimes = [];

var wrongFlags = [];
var levelTimes = [];

prepareData();


// console.log(originalDataset);
// console.log(players);
// console.log(startTimes);

getWrongFlags();
// console.log("\nWrong Flags: \n", wrongFlags);

getLevelTimes();
// console.log("\nLevel Times: \n", levelTimes);

combineResults();





function getWrongFlags() {
	for(i = 0; i< players.length; i++) {
		wrongFlags[i] = [0,0,0,0,0,0];
	}

	originalDataset.forEach(function (d){
        if(d.event.indexOf("Wrong flag submited") != -1) {
            wrongFlags[players.indexOf(d.ID)][d.level-1] += 1;
        }
    });
    // Giv
}

function getLevelTimes() {
	for(i = 0; i< players.length; i++) {
		levelTimes[i] = [0,0,0,0,0,0];
	}
	originalDataset
		.filter(function (d) { // get only events that mean end of level
                   return d.event === "Correct flag submited" || d.event === "Game finished" || 
                          d.event === "Level cowardly skipped" || d.event === "Game exited prematurely"; 
                })
		.forEach(function (d) {

			// IF YOU WANT TO SIMPLY COPY THE logical_time ATTRIBUTE OF LEVEL-ENDING EVENTS
			levelTimes[players.indexOf(d.ID)][d.level-1] = d.logical_time;
			

			// IF YOU WANTED TO CALCULATE LEVEL TIMES USING timestamp INSTEAD OF logical_time
			// var levelEnd = d.game_seconds;
			// var currentLevel = d.level;
   //          var currentPlayer = d.ID;
   //          var levelStartEvent = originalDataset.filter(function (d) { // This craziness figures out what that event is (where this level starts)
   //                      return (d.ID === currentPlayer) &&
   //                             (
   //                                  (+d.level === +currentLevel - 1 &&
   //                                          (d.event === "Correct flag submited" ||
   //                                           d.event === "Level cowardly skipped"))
   //                                  || 
   //                                  (currentLevel === "1" && d.event === "Game started")
   //                              );
   //                  })[0];
   //          if(!levelStartEvent) {
   //          	console.log("Error: can't find level start. Skipping.");
   //          	levelTimes[players.indexOf(d.ID)][d.level-1] = d.logical_time;
   //          	// return;
   //          } else {
	  //          var levelTime = (levelEnd - levelStartEvent.game_seconds);
   //          	// console.log(toHHMMSS(levelTime)); 
   //          	levelTimes[players.indexOf(d.ID)][d.level-1] = toHHMMSS(levelTime);
   //          }
		})
}
 function combineResults() {
 	var stats = []
 	console.log(players.length);
 	for(var i = 0; i<players.length; i++) {
 		var playerStat = {
 			playerID: players[i],
 			incorrectFlags: wrongFlags[i],
 			totalIncorrectFlags: wrongFlags[i].map()
 			times: levelTimes[i]
 		};
 		stats.push(playerStat);
 	}
 	console.log(stats);
 }





// Legacy help functions

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

function toHHMMSS (snippet) {
    var sec_num = parseInt(snippet, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    var hh = hours.toString();
    var mm = minutes.toString();
    var ss = seconds.toString();

    if(hh.length < 2) {hh = '0' + hh; }
    if(mm.length < 2) {mm = '0' + mm; }
    if(ss.length < 2) {ss = '0' + ss; }

    return hh+':'+mm+':'+ss;
}

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

