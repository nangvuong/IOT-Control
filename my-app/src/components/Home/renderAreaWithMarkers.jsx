import { Area, YAxis, ReferenceDot } from "recharts";

// Custom shape cho ReferenceDot (dot + text T/C)
const MarkerDot = ({ cx, cy, label, color }) => {
    if (cx == null || cy == null) return null;
    return (
        <g>
        {/* Dot */}
        <circle cx={cx} cy={cy} r={6} fill={color} stroke="white" strokeWidth={3} strokeOpacity={0.7} />
        {/* Text */}
        <text
            x={cx}
            y={label === "C" ? cy - 14 : cy + 24} // cách dot 12px phía trên
            textAnchor="middle"
            fontSize={14}
            fontWeight="bold"
            fill="white"
            opacity={0.7}
        >
            {label}
        </text>
        </g>
    );
};

// Hàm render AreaChart với min/max markers
const renderAreaWithMarkers = (sensorData, sensorKey, color, gradientId, label, unit) => {
    // Tìm giá trị nhỏ nhất/lớn nhất trong mảng dữ liệu
    const values = sensorData.map(d => d[sensorKey]);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const minPoint = sensorData.find(d => d[sensorKey] === minVal);
    const maxPoint = sensorData.find(d => d[sensorKey] === maxVal);

    return (
        <>
            {/* Vẽ đường area chính với gradient tương ứng */}
            <Area
                name={label}
                type="monotone"
                dataKey={sensorKey}
                stroke={color}
                fill={`url(#${gradientId})`}
                strokeWidth={5}
                animationDuration={0}   // tốc độ chạy
                animationEasing="ease-in-out"  // nhịp đều
            />
            {/* Đánh dấu điểm thấp nhất bằng nhãn T (thấp) */}
            <ReferenceDot
                x={minPoint.time}
                y={minVal}
                isFront
                shape={<MarkerDot color={color} label="T" />}
            />
            {/* Đánh dấu điểm cao nhất bằng nhãn C (cao) */}
            <ReferenceDot
                x={maxPoint.time}
                y={maxVal}
                isFront
                shape={<MarkerDot color={color} label="C" />}
            />
            {/* Trục Y riêng cho sensor với đơn vị đo */}
            <YAxis stroke="#fff" 
                label={{value: unit, angle: -90, position: 'insideLeft', fill: "white", opacity: 0.6, }} 
                tick={{ opacity:"0.7" }} 
                axisLine={false} 
                tickLine={false} 
            />
        </>
    );
};

export default renderAreaWithMarkers;
