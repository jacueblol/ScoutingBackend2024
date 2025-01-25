// Working
const autoWeights = 
{
    "Auto Leave" : 3,
    "L1 Auto": 3,
    "L2 Auto": 4,
    "L3 Auto": 6,
    "L4 Auto": 7,
    "Processor Auto": 2,
    "Net Auto": 4
}


const endGameWeights = 
{
    "Deep Cage": 12,
    "Shallow Cage": 6
}

const coralPieceWeights = {
    "L1 Teleop": 1,
    "L2 Teleop": 1,
    "L3 Teleop": 1,
    "L4 Teleop": 1,
}

const algaePieceWeights = {
    "Net Teleop": 1,
    "Processor Teleop": 1
}

const autoPieceWeights = {
    "L1 Auto": 1,
    "L2 Auto": 1,
    "L3 Auto": 1,
    "L4 Auto": 1,
    "Processor Auto": 1,
    "Net Auto": 1
}

const teleopWeights = {
    "L1 Teleop": 2,
    "L2 Teleop": 3,
    "L3 Teleop": 4,
    "L4 Teleop": 5,
    "Net Teleop": 4,
    "Processor Teleop": 2
};



const scoreWeights = {
    ...autoWeights,
    ...teleopWeights,
    ...endGameWeights,
  };







export function assignMatchScoreToEach(data, dataType) {
    let weightMap = scoreWeights;
    let newData = [...data];
    switch (dataType) {
        case "Auto" :
            weightMap = autoWeights;
            break;
        case "Teleop" :
            weightMap = teleopWeights;
            break;
        case "Endgame" :
            weightMap = endGameWeights;
            break;
        default:
            weightMap = scoreWeights;
            break;
    }
    for (let i = 1; i < newData.length; i++) {
        newData[i].push(assignScore(newData[i], newData[0], weightMap));
    }
    newData[0].push(dataType);
    return newData;
}


export function assignScores(data, dataTypeArr) {
    let newData = [...data];
    for (let i = 0; i < dataTypeArr.length; i++) {
        newData = assignMatchScoreToEach(newData, dataTypeArr[i]);
    }
    return newData;
}

export function assignAllScores(data) {
    return assignScores(data, ["Auto", "Teleop", "Endgame", "Score"]);
}

function assignScore(match, dataPoints, weightMap) {
    let score = 0;
    for (let i = 0; i < match.length; i++) {
        if (weightMap[dataPoints[i]] === undefined) continue;
        score += parseFloat(match[i]) * weightMap[dataPoints[i]];
    }
    return score.toFixed(2);
}

