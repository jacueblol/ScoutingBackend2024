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
        "Piece Count",
        "Auto",
        "Teleop",
        "Endgame",
        "Auto Pieces",
        "Auto Leave",
        "Branch Pieces",
        "Coral Fumbles",
        "L4",
        "L3",
        "L2",
        "L1",
        "Algae Fumbles",
        "Net",
        "Processor",
        "Climb Failure",
        "Defense"
    ];

    useEffect(() => {
        setTimeout(() => {
            fetchDataAndProcess("Rankings").then((data) => {
                console.log("Rankings Opened");
                let newData = whitelistDataPointObjArr([...data.rankingTable], numHeaders);
                
                sortByKey(newData, sortCol);
                setData(newData);
            });
        }, 1000);}, []);

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