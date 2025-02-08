import React, { useEffect, useState, useMemo } from 'react';
import { fetchDataAndProcess, resortColumnsByArray, whitelistDataPoints } from '../Data.js';
import RadarGraph from '../widgets/RadarGraphSearch.js';
import './Search.css';
import './Tables.css';
import Select from 'react-select';

export const radarDataPoints = [
    'Endgame',
    'Teleop',
    'Auto',
    'Score',
];
function Search() {
    const [averageData, setAverageData] = useState([]);
    const [matchData, setMatchData] = useState([]);
    const [team, setTeam] = useState('');
    const [teamData, setTeamData] = useState([]);
    const [teamMatchDataNum, setTeamMatchDataNum] = useState([]);
    const [teamMatchDataComment, setTeamMatchDataComment] = useState([]);
    const [matchDataType, setMatchDataType] = useState('num');
    const [maxMin, setMaxMin] = useState({});
    const [allTeams, setAllTeams] = useState([]);
    const [teamColors, setTeamColors] = useState([]);



    const numHeaders = [
        "Match Number",
        "Score",
        "Auto",
        "Teleop",
        "Endgame",
        "Deep Cage",
        "Shallow Cage",
        "Climb Failure",
        "Temp Failure",
        "Critical Failure"
    ];

    const commentHeaders = [
        "Match Number",
        "Name",
        "Auto Start",
        "Auto Pieces",
        "Auto Description",
        "What they did well",
        "What they did bad",    
        "Additional Comments"
    ]

    useEffect(() => {
        setTimeout(() => {
            fetchDataAndProcess("Search").then((data) => {
                console.log("Search Opened")
                setAverageData(data.teamAverageMap);
                setMatchData(data.bigTeamMapSplit);
                setMaxMin(data.maxMinOfAverages);
                setAllTeams(getAllTeams(data));
            });
        }, 1000);
    }, []);

    useEffect(() => {
        if (averageData.size !== 0 && averageData.size !== undefined) {
            setTeamData(resortColumnsByArray(whitelistDataPoints(averageData.get(team), numHeaders), numHeaders));
            // setTeamData(averageData.get(team));
        }
        if (matchData.length !== 0 && matchData.length !== undefined) {
            setTeamMatchDataNum(matchData[0].get(team));
            setTeamMatchDataComment(matchData[1].get(team));
        }
        // eslint-disable-next-line
    }, [team]);

    useEffect(() => {
        // check if the team list is empty or undefined
        if (!allTeams || allTeams.length === 0) return;
        let teamQueryString = '';
        allTeams.forEach((team) => {
            teamQueryString += `team=${team}&`;
        });

        const url = `https://api.frc-colors.com/v1/team?${teamQueryString}`;

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                setTeamColors(data.teams);
            })
            .catch((error) => console.error(error));
    }, [team, allTeams]);

    const getAllTeams = (data) => {
        let teams = new Set();
        data.teamAverageMap.forEach((value, key) => {
            teams.add(key);
        });
        return teams;
    };

    const emptyData = (data) => {
        return (
            data === undefined || data[0] === undefined || data[0].length === 0
        );
    };

    const getTeamColor = useMemo(() => {
        return (team) => {
            if (teamColors === undefined || teamColors.length === 0)
                return 'black';
            try {
                if (!(teamColors[team] && teamColors[team].colors))
                    return 'grey';
                const teamColor = teamColors[team]['colors']['primaryHex'];
                return teamColor;
            } catch (error) {
                console.error(error);
                return 'black';
            }
        };
    }, [teamColors]);

    const isColorCloseToWhite = (color) => {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 155;
    }

    const selecterConfig = {
        control: (base) => ({
            ...base,
            color: 'white',
            width: 300,
            height: 'auto',
            fontSize: 20,
            margin: '23% 0 0 0',
            backgroundColor: '#383838',
        }),

        singleValue: (styles, { data }) => {
            const teamColor = getTeamColor(data.value);
            const isTeamColorCloseToWhite = isColorCloseToWhite(teamColor);
            return {
                ...styles,
                color: isTeamColorCloseToWhite ? 'black' : 'white',
                backgroundColor: getTeamColor(data.value),
                borderRadius: 5,
                justifyContent: 'center',
                display: 'inline-flex',
                width: 65
            };
        },

        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            const teamColor = getTeamColor(data.value);
            let isTeamColorCloseToWhite = false;
            if (isFocused) {
                isTeamColorCloseToWhite = isColorCloseToWhite(teamColor);
            }
            return {
                ...styles,
                backgroundColor: isDisabled
                    ? "#383838"
                    : isSelected
                    ? teamColor
                    : isFocused
                    ? teamColor
                    : "#383838",
                color: isDisabled
                    ? '#ccc'
                    : isTeamColorCloseToWhite
                    ? 'black'
                    : 'white',
                cursor: isDisabled ? 'not-allowed' : 'default',
            };
        },
    };

    const renderSelect = () => {
        return (
            <Select
                options={Array.from(allTeams).map((team) => {
                    let teamColor;
                    if (Array.isArray(teamColors)) {
                        teamColors.map((color) => {
                            if (color.team === team) {
                                teamColor = color;
                            }
                            return color;
                        });
                    }
                    return {
                        value: team,
                        label: team,
                        color: teamColor ? teamColor.colors.primaryHex : '#000',
                    };
                })}
                onChange={(selected) => {
                    setTeam(selected.value);
                }}
                styles={selecterConfig}
                isMulti={false} // Set isMulti to false for single selection
                defaultValue={team} // Pass the selectedTeam value here
            />
        );
    };


    if (emptyData(teamData) || emptyData(teamMatchDataNum)) {
        return (
            <div className="search">
                <div className="search-bar">
                    <div className="search-input">{renderSelect()}</div>
                </div>
                <div className="team-stats">No Data</div>
            </div>
        );
    }

    // checks data point string against the data point array to
    // see if the data point should be on the radar chart
    const isRadarPoint = (dataPoint) => {
        for (let i = 0; i < radarDataPoints.length; i++) {
            if (dataPoint === radarDataPoints[i]) return true;
        }
        return false;
    };

    // selects data points from teamData and formats them for
    // the radar chart
    const convertRadar = () => {
        let arr = [];
        console.log(teamData);
        for (let i = 1; i < teamData[0].length; i++) {
            if (isRadarPoint(teamData[0][i])) {
                let min = maxMin.get(teamData[0][i])[0];
                let max = maxMin.get(teamData[0][i])[1];
                let val = ((teamData[1][i] - min) / (max - min)) * 100;
                arr.push({ key: teamData[0][i], value: val});
            }
        }
        console.log(arr);
        return arr;
    };

    // returns the section of the match data to display based on if the current data
    // type is either numbers or comments
    const matchContent = (matchesNum, matchesComment) => {
        let matches;
        if (matchDataType === 'num') {
            matches = resortColumnsByArray(whitelistDataPoints(matchesNum, numHeaders), numHeaders);
        } else {
            matches = resortColumnsByArray(whitelistDataPoints(matchesComment, commentHeaders), commentHeaders);
        }
        let matchDataNoKeys = matches.slice(1);
        sortByIndex(matchDataNoKeys, 0);
        return [matches[0], ...matchDataNoKeys];
    };

    function sortByIndex(arr, index) {
        return arr.sort((a, b) => {
            if (Number(a[index]) > Number(b[index])) return 1;
            else if (Number(a[index]) < Number(b[index])) return -1;
            else return 0;
        });
    }

    // changes match data type to either num or comment
    const handleSelectChange = (e) => {
        setMatchDataType(e.target.value);
    };

    let headers = teamData[0].slice(1);
    let stats = teamData[1].slice(1);
    let matches = matchContent(teamMatchDataNum, teamMatchDataComment);

    let matchHeads = matches[0];
    let matchStats = matches.slice(1);


    return (
        <div className="search">
            <div className="search-bar">
                <div className="search-input">{renderSelect()}</div>
            </div>

            <div className="team-stats">
                <div className="team-average-header">Averages</div>
                <div className="average-stats-container">
                    <table className="table">
                        {/* Render headers */}
                        <thead className="header">
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index}>{header}</th>
                                ))}
                            </tr>
                        </thead>

                        {/* Render content */}
                        <tbody>
                            <tr>
                                {stats.map((cellData, index) => (
                                    <td key={index}>
                                        {isNaN(cellData)
                                            ? cellData
                                            : Math.round(cellData * 100) / 100}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="radar">
                    <RadarGraph
                        data={convertRadar()}
                        angleKey="key"
                        radiusDomain={[0, 100]}
                        radar1={{
                            name: { team },
                            dataKey: 'value',
                            stroke: '#d4af37',
                            fill: '#d4af37',
                            fillOpacity: 0.6,
                        }}
                    />
                </div>
                <div className="team-match-header">Matches</div>
                <div className="match-content-selector">
                    <select className="selector" onChange={handleSelectChange}>
                        <option value="num">Numbers</option>
                        <option value="comment">Comments</option>
                    </select>
                </div>
                <div className="match-stats-container">
                    <table className="table">
                        {/* Render headers */}
                        <thead className="header">
                            <tr>
                                {matchHeads.map(
                                    (header, index) => (
                                        <th key={index}>{header}</th>
                                    )
                                )}
                            </tr>
                        </thead>

                        {/* Render data */}
                        <tbody>
                            {matchStats.map((rowData, rowIndex) => (
                                <tr key={rowIndex}>
                                    {rowData.map(
                                        (cellData, cellIndex) => (
                                            <td key={cellIndex}>{cellData}</td>
                                        )
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Search;