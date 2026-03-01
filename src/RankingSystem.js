// Working
const autoWeights = {
    "Climb Auto": 5,
    "Start Depot": 2,
    "Start Hub": 2,
    "Start Outpost": 2,
    "Outpost Intake": 3,
    "Depot Intake": 3,
    "Center Intake Auto": 3,
    "Score Auto": 4,
    "Climb Failure Auto": -5
}

// Teleop weights
const teleopWeights = {
    "Score Teleop": 3,
    "Pass Teleop": 2,
    "Fumble Percent": -0.5  
};

const endGameWeights = {
    "L1 Climb": 3,
    "L2 Climb": 5,
    "Climb Failure": -3
}


const failureWeights = {
    "Temp Failure": -2,
    "Critical Failure": -10
}

// Intake weights
const intakeWeights = {
    "Ground Intake": 2,
    "Station Intake": 2
}

const obstacleWeights = {
    "Over Bump": 3,
    "Under Trench": 3,
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
    "Score Teleop": 4,
    "Score Auto": 5,
    "Pass Teleop": 3,
    "Climb Auto": 6,
    "L2 Climb": 7,
    "L1 Climb": 4,
    "Ground Intake": 3,
    "Station Intake": 3
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

