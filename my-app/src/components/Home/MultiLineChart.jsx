import { Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart } from "recharts";

// Component vẽ biểu đồ 3 đường
const MultiLineChart = (sensorData) => {
  // ResponsiveContainer để biểu đồ tự co giãn bên trong Card
  return (
    <ResponsiveContainer width="95%" height={300}>
      <LineChart data={sensorData} margin={{ top: 30, right: 30, left: 10, bottom: 30 }}>
        {/* Trục X hiển thị thời gian ở định dạng HH:mm:ss */}
        <XAxis
          dataKey="time"
          stroke="#fff"
          tick={{ opacity: 0.7, fill: "#fff" }}
          axisLine={false}
          tickFormatter={(time) =>
            new Date(time).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          }
        />

        {/* Trục Y trái (Temp + Humi) */}
        <YAxis
          yAxisId="left"
          stroke="#fff"
          label={{
            value: "% / °C",
            angle: -90,
            position: "insideLeft",
            fill: "white",
            opacity: 0.6,
          }}
          tick={{ opacity: 0.7, fill: "#fff" }}
          axisLine={false}
          tickLine={false}
        />

        {/* Trục Y phải (Light) */}
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#fff"
          label={{
            value: "Lux",
            angle: -90,
            position: "insideRight",
            fill: "white",
            opacity: 0.6,
          }}
          tick={{ opacity: 0.7, fill: "#fff" }}
          axisLine={false}
          tickLine={false}
        />

        {/* Lưới ngang/dọc với độ mờ nhẹ để dễ quan sát */}
        <CartesianGrid stroke="rgba(255,255,255,0.1)" yAxisId="left" vertical={false} />
        <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" horizontal={false} />

        {/* Tooltip hiển thị chi tiết tại điểm hover */}
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0,0,0,0.1)",
            border: "none",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          labelFormatter={(time) =>
            new Date(time).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          }
          position={{ y: 0 }}
        />

        {/* Legend đặt trong biểu đồ với font nổi bật */}
        <Legend formatter={(value) => <strong style={{ fontWeight: 1500 ,opacity: 0.6, fontSize: 16 }}>{value}</strong>} />

        {/* Đường nhiệt độ */}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="temp"
          name="Nhiệt độ (°C)"
          stroke="#ff7e5f"
          strokeWidth={4}
          dot={false}
          animationDuration={0}
          animationEasing="ease-in-out"
        />

        {/* Đường độ ẩm */}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="humi"
          name="Độ ẩm (%)"
          stroke="#3498db"
          strokeWidth={4}
          dot={false}
          animationDuration={0}
          animationEasing="ease-in-out"
        />

        {/* Đường ánh sáng gắn với trục Y bên phải */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="light"
          name="Ánh sáng (Lux)"
          stroke="#f1c40f"
          strokeWidth={4}
          dot={false}
          animationDuration={0}
          animationEasing="ease-in-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MultiLineChart;
