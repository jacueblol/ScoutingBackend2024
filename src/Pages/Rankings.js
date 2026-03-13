import React, { useEffect, useState } from "react";
import TreeGraph from "../widgets/TreeGraph";
import {fetchDataAndProcess, resortColumnsByArray, whitelistDataPoints, whitelistDataPointObjArr} from '../Data.js'
import "./Tables.css";
import "./Rankings.css";

function Rankings() {
    const [data, setData] = useState([]);
    const [sortCol, setSortCol] = useState("Score");
    const [sortOrder, setSortOrder] = useState(1); // New state variable for sort order

    const numHeaders = [
        "Team",
        "Rating",
        "Score",
        "Auto",
        "Teleop", 
        "Endgame",  
        // Auto section
        "Climb Auto",
        "Score Auto",
        "Climb Failure Auto",
  // Total auto score
        // Teleop section
        "Score Teleop",
        "Pass Teleop",
        "Fumble Percent",
 // Total teleop score
        // Endgame/Climb section
        "L1 Climb",
        "L2 Climb",
        "Traversal Climb",
        "Climb Failure",
// Total endgame score
        // Other stats
        "Ground Intake",
        "Station Intake",
        "Temp Failure",
        "Critical Failure",
        "Over Bump",
        "Under Trench",
        "Shooting While Driving",
        "Failure",  // Total failure score
        "Intake",   // If you have an intake category
        "Obstacles" // If you have an obstacles category
    ];

    useEffect(() => {
        setTimeout(() => {
            fetchDataAndProcess("Rankings").then((data) => {
                console.log("Rankings Opened");
                console.log("Raw data:", data.rankingTable);  // ADD THIS
                console.log("First item:", data.rankingTable[0]);  // AND THIS
                
                let newData = whitelistDataPointObjArr([...data.rankingTable], numHeaders);
                console.log("After whitelist:", newData[0]);  // AND THIS
                
                sortByKey(newData, sortCol);
                setData(newData);
            });
        }, 1000);
    }, []);

    useEffect(() => {
        if (data !== undefined && data !== null) {
            let newData = [...data];

            sortByKey(newData, sortCol);
        
            setData(newData);
        }
    }, [sortOrder, sortCol]);

    function sortByKey(arr, key) {
        return arr.sort((a, b) => {
            if (Number(a[key]) > Number(b[key])) return -1 * sortOrder;
            else if (Number(a[key]) < Number(b[key])) return 1 * sortOrder;
            else return 0;
        });
    }

    const handleSort = (header) => { // New function to handle sorting
        if (header === sortCol) {
            setSortOrder(sortOrder * -1); // Toggle the sort order
        }
        setSortCol(header);
    };

    if (data.length === 0) {
        return <div>Loading...</div>;
    }

    const convertTreeMap = () => {
        let arr = [];
        for (let i = 0; i < data.length; i++) {
            arr.push({
                "name": data[i]["Team"],
                "children": [
                    {
                        "name": data[i]["Team"].slice(0, -2),
                        "Score": parseInt(data[i]["Score"])
                    }
                ]
            });
        }
        return arr;
    }
    let headers = Object.keys(data[0]);

    return (
        <div className="rankings-wrapper">
            <div className="container">
                <link
                    rel="stylesheet"
                    href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css"
                ></link>
                <table className="table">
                    <thead className="header">
                        <tr>
                            {headers.map((header, index) => (
                                <th key={index} onClick={() => handleSort(header)}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                {headers.map((header, index) => (
                                    <td key={index}>
                                        {(isNaN(item[header])) ? item[header] : Math.round(item[header] * 100) / 100}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}

export default Rankings;