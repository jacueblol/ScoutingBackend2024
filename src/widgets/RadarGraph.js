import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from "recharts";

const RadarGraph = (props) => {
    const radars = props.radars.slice(0, 10); // Limit to 10 teams

    return (
        <div>
            <RadarChart outerRadius={90} width={400} height={300} data={props.data}>
                <PolarGrid />
                <PolarAngleAxis dataKey={props.angleKey} />
                <PolarRadiusAxis angle={30} domain={props.radiusDomain} />
                {radars.map((radar, index) => (
                        <Radar
                            key={index}
                            name={radar.name}
                            dataKey={radar.dataKey}
                            stroke={radar.stroke}
                            fill={radar.fill}
                            fillOpacity={radar.fillOpacity}
                        />
                    ))
                }
            </RadarChart>
        </div>
    );
};

export default RadarGraph;