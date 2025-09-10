
import { getAllData } from "./widgets/JsonData.js";
import { assignAllScores } from "./RankingSystem.js";
import { predictMatch } from "./MatchPredictor.js";
import { eventCode } from "./App.js";
import { radarDataPoints } from "./Pages/Search.js";


let minQual = localStorage.getItem("minQual") === null 
                ? 0 
                : parseInt(localStorage.getItem("minQual"));
let maxQual = localStorage.getItem("maxQual") === null 
                ? 10000 
                : parseInt(localStorage.getItem("maxQual"));

let includeDead = localStorage.getItem("includeDead") === null 
                ? true 
                : localStorage.getItem("includeDead") === 'true' 
                    ? true 
                    : false;
let mean = localStorage.getItem("average") === null 
                ? true 
                : localStorage.getItem("average") === 'median' 
                    ? false
                    : true;

let rawData;
let commentData;
let numData;
let commentTeamMap;
let numTeamMap;
let bigTeamMap;
let allData;
let teamAverageMap;
let rankingTable;
let maxMin;
let maxMinOfAverages;
let rawDataMap;
let bigTeamMapSplit;
let teamScoreMap;   
let teamRankingArr;
let globalAverageScore;
// Use an async function to fetch and process your data
// Working:
export const fetchDataAndProcess = async (fileName) => {
    const data = await getAllData();
    if (eventCode.toLowerCase() === "all") {
        let bigData = JSON.parse(data)["test2025"];
        rawData = mergeEventCodes(bigData);
    }
    else {
        let bigData = JSON.parse(data)["test2025"];
        rawData = bigData[getEventCode(Object.keys(bigData), eventCode)];
    }
    commentData = resortColumnByPoint(
        convertCommentsToTableForm(rawData),
        "Team",
        0
    );
    numData = convertNumDataToTableForm(rawData);
    numData = assignAllScores(numData);

    // 2d Array, numData[0][i] is the ith data point string
    // numData[i][j] the jth datapoint in the (i-1th) match
    numData = resortColumnsByArray(numData, 
        [
            "Team",
            "Score",
            "Match Number",
            "Auto",
            "Auto Leave",
            "Algae Removed Auto",
            "L1 Auto",
            "L2 Auto",
            "L3 Auto",
            "L4 Auto",
            "Net Auto",
            "Processor Auto",
            "Coral Fumble Auto",
            "Processor Fumble Auto",
            "Net Fumble Auto",
            "Teleop",
            "Algae Removed Teleop",
            "L1 Teleop",
            "L2 Teleop",
            "L3 Teleop",
            "L4 Teleop",
            "Net Teleop",
            "Processor Teleop",
            "Coral Fumble Teleop",
            "Processor Fumble Teleop",
            "Net Fumble Teleop",
            "Endgame",
            "Deep Cage",
            "Shallow Cage",
            "Climb Failure",
            "Critical Failure",
            "Temp Failure", 
            "Station Intake",
            "Ground Intake"
        ]);   
    // same formatting as numData
    commentData = resortColumnsByArray(commentData, 
        [
          "Team",
          "Match Number",
          "Name",
          "Auto Pieces",
          "Auto Description",
          "What They Did Bad", 
          "What They Did Well",
          "Additional Comments"
        ]);
    switch (fileName) {
        case "RawData":
            return {
                rawDataMap: convertTableToMap(numData),
                commentDataMap: convertTableToMap(commentData),
            };
        case "Search":
            console.log()
            numTeamMap = convertToTeamMap(numData);
            teamAverageMap = getTeamAverageMap(includeDead, minQual, maxQual, mean);
            // predictMatch(teamAverageMap, [['7', '7', '7'], ['7', '7', '7']]);
            return {
                teamAverageMap: teamAverageMap,
                bigTeamMapSplit: [convertToTeamMap(numData), convertToTeamMap(commentData)],
                maxMinOfAverages: getMaxMinOfAverages(),
                globalAverageMap: getGlobalAverageMap(radarDataPoints)
            };
        case "Rankings":
            numTeamMap = convertToTeamMap(numData);
            teamAverageMap = getTeamAverageMap(includeDead, minQual, maxQual, mean);
            return {
                teamAverageMap: teamAverageMap,
                rankingTable: getRankingTable()
            }
        case "CompareTeams":
            numTeamMap = convertToTeamMap(numData);
            teamAverageMap = getTeamAverageMap(includeDead, minQual, maxQual, mean);
            return {
                teamAverageMap: teamAverageMap,
                maxMinOfAverages: getMaxMinOfAverages(),
            };

    }
};

const getTeamData = (team) => {
  return bigTeamMap.get(team);
};

const getTeamNumData = (team) => {
  if (numTeamMap.get(team) == undefined) {
    return [[], []];
  }
  return numTeamMap.get(team);
};

const getTeamCommentData = (team) => {
  return commentTeamMap.get(team);
};

// Working
function convertToTableForm(data, datatype) {
  let table = [];

  // rows of the table
  let row = getIndividualDatapoints(data);
  row[0].push("Team");
  row[1].push("Team");

  // push either commentData or numData datapoints
  // to first index of table (table[0])
  if (datatype == "comments") {
    row[0].push("Match Number");
    table.push(row[0]);
  } else {
    table.push(row[1]);
  }

  // Each Match
  const matches = Object.keys(data);

  // Starts at one because table[0] is dataPoints
  for (let i = 1; i <= matches.length; i++) {
    // matchData simplifies data down to each match
    const matchData = data[matches[i - 1]];
    const bots = Object.keys(matchData);
    for (let j = 0; j < bots.length; j++) {

      if (Object.keys(matchData[bots[j]]).length < 2) {
        continue;
      }
      row = [];
      //  gets either num or comment data of each bot
      const botData = matchData[bots[j]][datatype];

      const dataKeys = Object.keys(botData);
      for (let k = 0; k < dataKeys.length; k++) {
        row.push(botData[dataKeys[k]]);
      } 
      // gets team number
      let teamNameStart = 0;
      for (let i = 0; i < bots[j].length; i++) {
        if (bots[j][i] == "-") {
          teamNameStart = i + 1;
        }
      }
      row.push(bots[j].substring(teamNameStart, bots[j].length));
      if (datatype == "comments") {
        row.push(matchData[bots[j]]["data"]["Match Number"]);
      }
      table.push(row);
    }
  }

  return table;
}
// Working:
function convertCommentsToTableForm(data) {
  return convertToTableForm(data, "comments");
}
// Working:
function convertNumDataToTableForm(data) {
  return convertToTableForm(data, "data");
}

function mergeEventCodes(data) {
    let keys = Object.keys(data);
    let mergedData = {};
    for (let i = 0; i < keys.length; i++) {
        let code = keys[i];
        let matches = Object.keys(data[keys[i]]);
        for(let j = 0; j < matches.length; j++) {
            mergedData[code + ": " + matches[j]] = data[code][matches[j]];
        }
    }
    return mergedData;
}

function getEventCode(array, eventCode) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].toLowerCase() == eventCode.toLowerCase()) {
            return array[i];
        }
    }
    return "";
} 
// Working:
function convertAllToTableForm(data) {
  let tempComments = convertCommentsToTableForm(data);
  let tempNumData = convertNumDataToTableForm(data);
  let table = [];
  tempComments[0].pop();
  table.push([tempComments[0], tempNumData[0]].flat());
  table[0].pop();
  for (let i = 0; i < tempComments.length - 1; i++) {
    tempComments[i + 1].pop();
    table.push([tempComments[i + 1], tempNumData[i + 1]].flat());
    table[i + 1].pop();
  }
  return table;
}
function getMaxMin(data) {
    console.log(data);
    let sol = new Map();
    if (data.length == 0) {
        return sol;
    }
    for (let i = 0 ; i < data[0].length; i++) {
        sol.set(data[0][i], [data[1][i], data[1][i]]);
    }
    for (let i = 2; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            if (parseFloat(data[i][j]) < parseFloat(sol.get(data[0][j])[0])) {
                sol.set(data[0][j], [data[i][j], sol.get(data[0][j])[1]]);
            }
            if (parseFloat(data[i][j]) > parseFloat(sol.get(data[0][j])[1])) {
                sol.set(data[0][j], [sol.get(data[0][j])[0], data[i][j]])
            }
        }
    }
    return sol;
}


function getGlobalAverageMap(dataPoints) {
    let map = new Map();
    for (let i = 0; i < dataPoints.length; i++) {
        map.set(dataPoints[i], getGlobalAverage(dataPoints[i]));
    }
    return map;
}

function getMaxMinOfAverages() {
    let arr = [];
    let keys = Array.from(teamAverageMap.keys());
    arr.push(teamAverageMap.get(keys[0])[0]);
    for (let i = 0; i < keys.length; i++) {
        arr.push(
            mean ? 
                getTeamAverage(keys[i], true, minQual, maxQual)[1] :
                getTeamAverageMedian(keys[i], true, minQual, maxQual)[1])
    } 
    return getMaxMin(arr);
}
// Working but need to make easier to use:
function resortColumn(data, columnInitial, columnGoal) {
  let table = [];
  let row = [];
  for (let i = 0; i < data.length; i++) {
    row = [...data[i]];
    let temp = row[columnInitial];
    row[columnInitial] = row[columnGoal];
    row[columnGoal] = temp;
    table.push(row);
  }
  return table;
}
// Working Perfectly
export function resortColumnsByArray(data, orderArr) { 
  let newData = [...data];
  for (let i = 0; i < orderArr.length; i++) {
    newData = resortColumnByPoint(newData, orderArr[i], i);
  }
  return newData;
}

export function whitelistDataPoints(data, orderArr) {
    let arr = [];
    for (let i = 0; i < data[0].length; i++) {
        if (!orderArr.includes(data[0][i])) {
            arr.push(data[0][i]);
        }
    }
    return removeDataPoints(data, arr);
}

export function whitelistDataPointObjArr(data, orderArr) {
    let newArr = [];
    for (let i = 0; i < data.length; i++) {
        let newObj = {};
        for (let j = 0; j < orderArr.length; j++) {
            if (data[i][orderArr[j]] === undefined) {
                continue;
            }
            newObj[orderArr[j]] = data[i][orderArr[j]];
        }
        newArr.push(newObj)
    }
    return newArr;
}

// Working but need to make easier to use:
function resortColumnByPoint(data, point, columnGoal) {
  for (let i = 0; i < data[0].length; i++) {
    if (data[0][i] == point) {
      return resortColumn(data, i, columnGoal);
    }
  }
  return data;
}


function renameHeader(data, headerInitial, headerFinal) {
    for (let i = 0; i < data[0].length; i++) {
        if (data[0][i] == headerInitial) {
            data[0][i] = headerFinal;
            break;
        }
    }
}

function getGlobalAverage(dataPoint) {
    let dataPointMap = getDataPointMap(dataPoint);
    let keys = Object.keys(dataPointMap);
    let total = 0;
    for (let i = 0; i < keys.length; i++) {
        total += parseFloat(dataPointMap[keys[i]]);
    }
    return total / keys.length;
}


function getLocalAverage(team, dataPoint) {
    let map = getDataPointMap(dataPoint);
    return map[team];
}

function getDataPointMap(dataPoint) {
    let keys = Array.from(teamAverageMap.keys());
    if (keys.length == 0) {
        return;
    }
    let scoreTeamMap = {};
    let pointIndex = getDataPointIndex(dataPoint, teamAverageMap.get(keys[0])[0]);
    for (let j = 0; j < teamAverageMap.get(keys[0])[0].length; j++) {
        if (teamAverageMap.get(keys[0])[0][j] === dataPoint) {
            pointIndex = j;
            break;
        }
    }
    for (let i = 0; i < keys.length; i++) {
        scoreTeamMap[keys[i]] = teamAverageMap.get(keys[i])[1][pointIndex];
    }
    return scoreTeamMap;
}

function getDataPointIndex(dataPoint, dataPoints) {
    for (let i = 0; i < dataPoints.length; i++) {
        if (dataPoints[i] == dataPoint) {
            return i;
        }
    }
    return 0;
}


function getTeamRankingArr() {
    let orderedTeamMap = new Map();
    let keys = Object.keys(teamScoreMap);
    for (let i = 0; i < keys.length; i++) {
        orderedTeamMap.set(keys[i], teamScoreMap[keys[i]]);
    }
    orderedTeamMap = new Map([...orderedTeamMap.entries()].sort((a, b) => b[1] - a[1]));
    return Array.from(orderedTeamMap.keys());
}

export function getTeamRank(team) {
    for (let i = 0; i < teamRankingArr.length; i++) {
        if (teamRankingArr[i] == team) {
            return i + 1;
        }
    }
    return -1;
}

function removeDataPoint(data, dataPoint) {
    let newTeamData = [];
    for (let j = 0; j < data.length; j++) {
      newTeamData.push([]);
      for (let i = 0; i < data[j].length; i++) {
        if (data[0][i] != dataPoint) {
          newTeamData[j].push(data[j][i]);
        }
      }
    }
    return newTeamData;
}

function removeDataPoints(data, dataPointArr) {
    let newData = [...data];
    for (let i = 0; i < dataPointArr.length; i++) {
        newData = removeDataPoint(newData, dataPointArr[i]);
    }
    return newData
}
// Working
function convertTableToMap(data) {
  let mapArr = [];

  for (let i = 1; i < data.length; i++) {
    let map = {};
    for (let j = 0; j < data[i].length; j++) {
      map[data[0][j]] = data[i][j];
    }
    mapArr.push(map);
  }
  return mapArr;
}
// Working
function getRankingTable() {
  let dataArr = [];
  let teams = Array.from(teamAverageMap.keys());
  for (let i = 0; i < teams.length; i++) {
    dataArr.push(convertTableToMap(
        mean ? getTeamAverage(teams[i], includeDead, minQual, maxQual)
               : getTeamAverageMedian(teams[i], includeDead, minQual, maxQual))[0]);
  }
  return dataArr;
}


// Working:
function getIndividualDatapoints(data) {
  let dataPoints = [[], []];

  //gets all the matches
  let matchKeys = Object.keys(data);

  // if there are no matches, return empty table
  if (matchKeys.length == 0) {
    return dataPoints;
  }

  // gets all the data points using the data from the first bot in the first match
  // matchKeys[0] is the first match
  // Object.keys(data[matchKeys[0]])[0] is the first bot in the first match

  let botKeys = Object.keys(data[matchKeys[0]]);

  let commentPoints = Object.keys(data[matchKeys[0]][botKeys[0]]["comments"]);

  let numDataPoints = Object.keys(data[matchKeys[0]][botKeys[0]]["data"]);

  // pushes those data points to the first row of the table (the header)
  for (let i = 0; i < commentPoints.length; i++) {
    dataPoints[0].push(commentPoints[i]);
  }
  for (let i = 0; i < numDataPoints.length; i++) {
    dataPoints[1].push(numDataPoints[i]);
  }
  return dataPoints;
}

// Working:
function convertToTeamMap(data) {
  let teamMap = new Map();
  // const points = getIndividualDatapoints(rawData);
  let teamNameIndex = 0;
  if (data.length == 0) {
    return {};
  }
  const points = data[0];
  for (let i = 0; i < data[0].length; i++) {
    if (points[i] == "Team") {
      teamNameIndex = i;
      break;
    }
  }
    for (let i = 1; i < data.length; i++) {
        if (!teamMap.has(data[i][teamNameIndex])) {
            teamMap.set(data[i][teamNameIndex], [data[0], data[i]]);
        } else {
            teamMap.get(data[i][teamNameIndex]).push(data[i]);
        }
    }
    return teamMap;
}

// Working
function getTeamAverage(team, includeDead, first, last) {
  let dataArrTest = [[], []];
  let teamData = getTeamNumData(team);
  let newTeamData = [];
  let critFailIndex = getDataPointIndex("Critical Failure", teamData[0]);
  let matchNumberIndex = getDataPointIndex("Match Number", teamData[0]);
  let jMinusValue = 0;
  for (let j = 0; j < teamData.length; j++) {
    if ((teamData[j][critFailIndex] == 1 && !includeDead)
         || (teamData[j][matchNumberIndex] < minQual) || teamData[j][matchNumberIndex] > maxQual)
    {
        jMinusValue++;
        continue;
    }
    newTeamData.push([]);
    for (let i = 0; i < teamData[j].length; i++) {
      if (teamData[0][i] != "Match Number") {
        newTeamData[j - jMinusValue].push(teamData[j][i]);
      }
    }
  }
  dataArrTest[0].push(...newTeamData[0]);
  if (newTeamData.length <= 1) {
    return dataArrTest;
  }
  dataArrTest[1].push(...newTeamData[1]);


  for (let i = 2; i < newTeamData.length; i++) {
    for (let j = 0; j < newTeamData[0].length; j++) {
      dataArrTest[1][j] =
        parseFloat(newTeamData[i][j]) + parseFloat(dataArrTest[1][j]);
    }
  }


  // not a bug
  for (let i = 0; i < dataArrTest[1].length; i++) {
    dataArrTest[1][i] /= newTeamData.length - 1;
    dataArrTest[1][i] = dataArrTest[1][i].toFixed(1);
  }
  return dataArrTest;
}
function getTeamAverageMedian(team, includeDead, first, last) {
    let teamData = getTeamNumData(team);
    let critFailIndex = getDataPointIndex("Critical Failure", teamData[0]);
    let newTeamData = [];
    let dataArrTest = [[],[]];
    let matchNumberIndex = getDataPointIndex("Match Number", teamData[0]);
    let jMinusValue = 0;
    for (let j = 0; j < teamData.length; j++) {
        if ((teamData[j][critFailIndex] == 1 && !includeDead)
             || (teamData[j][matchNumberIndex] < minQual) || teamData[j][matchNumberIndex] > maxQual)
        {
            jMinusValue++;
            continue;
        }
        newTeamData.push([]);
        for (let i = 0; i < teamData[j].length; i++) {
          if (teamData[0][i] != "Match Number") {
            newTeamData[j - jMinusValue].push(teamData[j][i]);
          }
        }
      }
      dataArrTest[0].push(...newTeamData[0]);
      if (newTeamData.length <= 1) {
        return dataArrTest;
      }
    for (let i = 0; i < newTeamData[0].length; i++) {
      let samples = [];
      for (let j = 1; j < newTeamData.length; j++) {
          samples.push(parseFloat(newTeamData[j][i]));
      }
      dataArrTest[1].push(median(samples));
    }
    for (let i = 0; i < dataArrTest[1].length; i++) {
        dataArrTest[1][i] = dataArrTest[1][i].toFixed(1);
    }
    return dataArrTest;
      
}

function median(arr) {
  arr.sort((a, b) => a - b);

  const mid = Math.floor(arr.length / 2);

  if (arr.length % 2 === 0) {
    return (arr[mid - 1] + arr[mid]) / 2;
  } else {
    return arr[mid];
  }
}

// Working:
function getTeamAverageMap(includeDead, first, last, mean) {
  let averageMap = new Map();
  let teams = [];
  numTeamMap.forEach((value, key) => {
    teams.push(key);
  });
  for (let i = 0; i < teams.length; i++) {
    let teamAverage = mean ? getTeamAverage(teams[i], includeDead, first, last)
                 : getTeamAverageMedian(teams[i], includeDead, first, last);
    if (teamAverage.length > 1
            && teamAverage[1].length > 0) {
        averageMap.set(teams[i], teamAverage);
    }
  }
  return averageMap;
}
