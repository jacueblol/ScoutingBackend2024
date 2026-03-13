// Working
const autoWeights = {
    "Climb Auto": 5,
    "Score Auto": 4,
    "Climb Failure Auto": -3
}

// Teleop weights
const teleopWeights = {
    "Score Teleop": 4,
    "Pass Teleop": 4,
    "Fumble Percent": -3.5  
};

const endGameWeights = {
    "L1 Climb": 4,
    "L2 Climb": 6,
    "Transversal Climb": 9,
    "Climb Failure": -2
}


const failureWeights = {
    "Temp Failure": 0.5,
    "Critical Failure": 1
}

// Intake weights
const intakeWeights = {
    "Ground Intake": 1,
    "Station Intake": 1
}

const obstacleWeights = {
    "Over Bump": 2,
    "Under Trench": 2,
    "Shooting While Driving": 4
}

const scoreWeights = {
    ...autoWeights,
    ...teleopWeights,
    ...endGameWeights,
    ...failureWeights,
    ...intakeWeights,
    ...obstacleWeights
};

const ratingWeights = {
    "Score Teleop": 1.9,
    "Score Auto": 2,
    "Pass Teleop": 1.6,
    "Climb Auto": 7,
    "L2 Climb": 7,
    "L1 Climb": 6,
    "Transversal Climb": 9,
    "Shooting While Driving": 1.5
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
        case "Intake":
            weightMap = intakeWeights;
            break;
        case "Obstacles":
            weightMap = obstacleWeights;
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
        "Intake",
        "Obstacles",
        "Failure",
        "Score",
        "Rating"
    ]);
}

function assignScore(match, dataPoints, weightMap) {
    let score = 0;
    for (let i = 0; i < match.length; i++) {
        if (weightMap[dataPoints[i]] === undefined) continue;
        if (weightMap[dataPoints[i]] == '10' || dataPoints[i] == '8') score += 2;
        score += parseFloat(match[i]) * weightMap[dataPoints[i]];
    }
    return score.toFixed(2);
}

