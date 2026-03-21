// Working
const autoWeights = {
    "Climb Auto": 15,
    "Score Auto": 1,
}

// Teleop weights
const teleopWeights = {
    "Score Teleop": 1
}

const endGameWeights = {
    "L1 Climb": 10,
    "L2 Climb": 20,
    "Transversal Climb": 30
}

const failureWeights = {
    "Temp Failure": 0.5,
    "Critical Failure": 1
}

const scoreWeights = {
    ...autoWeights,
    ...teleopWeights,
    ...endGameWeights,
    ...failureWeights
}

const ratingWeights = {
    "Score Teleop": 1,
    "Score Auto": 1,
    "Climb Auto": 15,
    "L2 Climb": 10,
    "L1 Climb": 20,
    "Transversal Climb": 30
}

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
        case "Failure":
            weightMap = failureWeights;
            break;
        case "Rating":
            weightMap = ratingWeights;
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
    return assignScores(data, [
        "Auto",
        "Teleop",
        "Endgame",
        "Failure",
        "Score",
        "Rating"
    ]);
}

function assignScore(match, dataPoints, weightMap) {
    let score = 0;
    for (let i = 0; i < match.length; i++) {
        if (weightMap[dataPoints[i]] === undefined) continue
        if (weightMap[dataPoints[i]] === '10' || dataPoints[i] === '8') score += 2;
        score += parseFloat(match[i]) * weightMap[dataPoints[i]];
    }
    return score.toFixed(2);
}