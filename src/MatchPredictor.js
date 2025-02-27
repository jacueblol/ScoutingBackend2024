
let teamAverageMap;

export function predictMatch(newTeamAverageMap, teams) {
    teamAverageMap = newTeamAverageMap;
    let winner = "Draw";
    console.log(getFullTeamResult(teams[0]));
    let team1Result = getFullTeamResult(teams[0]);
    let team2Result = getFullTeamResult(teams[1]);
    winner = findWinner(team1Result[4][team1Result.length - 1], team2Result[4][team2Result.length - 1]);
    console.log(winner);
}

function getFullTeamResult(teamArr) {
    let scoreTotal = 0;
    let teleopTotal = 0;
    let autoTotal = 0;
    let endgameTotal = 0;
    let map = new Map();
    // order is team names, autos, teleop, endgame, score
    let finalArr = [[], [], [], [], []];
    for (let i = 0; i < teamArr.length; i++) {
        console.log(teamAverageMap);
        console.log(teamAverageMap.get(teamArr[i]))
        let score = getDataPointValue("Score", teamAverageMap.get(teamArr[i]));
        let auto = getDataPointValue("Auto", teamAverageMap.get(teamArr[i]));
        let teleop = getDataPointValue("Teleop", teamAverageMap.get(teamArr[i]));
        let endgame = getDataPointValue("Endgame", teamAverageMap.get(teamArr[i]));
        finalArr[0].push(teamArr[i]);
        finalArr[1].push(auto);
        finalArr[2].push(teleop);
        finalArr[3].push(endgame);
        finalArr[4].push(score);
        scoreTotal += parseFloat(score);
        autoTotal += parseFloat(auto);
        teleopTotal += parseFloat(teleop);
        endgameTotal += parseFloat(endgame);
    
    }
    finalArr[0].push("Final:");
    finalArr[1].push(autoTotal);
    finalArr[2].push(teleopTotal);
    finalArr[3].push(endgameTotal);
    finalArr[4].push(scoreTotal);
    console.log(finalArr);
    return finalArr;
}

function getDataPointValue(dataPoint, arr) {
    for (let i = 0; i < arr[0].length; i++) {
        if (arr[0][i] == dataPoint) {
            return arr[1][i];
        }
    }
    return 0;
}

function findWinner(team1Score, team2Score) {
    let score = team1Score - team2Score;
    if (score == 0) {
        return "Draw";
    }
    return score > 0 ? "Team 1" : "Team 2";
}