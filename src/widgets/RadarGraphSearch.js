import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from "recharts";

const RadarGraphSearch = (props) => {
    return (
        <div>
            <RadarChart outerRadius={90} width={350} height={250} data={props.data}>
                <PolarGrid />
                <PolarAngleAxis dataKey={props.angleKey} />
                <PolarRadiusAxis angle={30} domain={props.radiusDomain} />
                <Radar
                    name={props.radar1.name}
                    dataKey={props.radar1.dataKey}
                    stroke={props.radar1.stroke}
                    fill={props.radar1.fill}
                    fillOpacity={props.radar1.fillOpacity}
                />
                <Radar
                    name = {"Average"}
                    stroke = {props.radar1.stroke}
                    fill="#82ca9d"
                     fillOpacity={0.6}
                    dataKey = {'average'}
                />
            </RadarChart>
        </div>
    );
};

export default RadarGraphSearch;