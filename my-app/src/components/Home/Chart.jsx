import { AreaChart, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import renderAreaWithMarkers from "./renderAreaWithMarkers";

// Biểu đồ vùng một cảm biến: đổi dataset theo cảm biến được chọn từ hover card
export default function Chart (sensor, sensorData) {
    // ResponsiveContainer giúp biểu đồ co giãn theo card chứa
    return (
        <ResponsiveContainer width="95%" height={300} >
            <AreaChart data={sensorData} margin={{ top: 30, right: 30, left: 10, bottom: 30 }}>
                <defs>
                    {/* Định nghĩa gradient cho 3 loại cảm biến */}
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="10%" stopColor="#ff7e5f" />
                        <stop offset="90%" stopColor="#feb47b" />
                    </linearGradient>
                    <linearGradient id="colorLight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f1c40f" />
                        <stop offset="95%" stopColor="#f39c12" />
                    </linearGradient>
                    <linearGradient id="colorHumi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="10%" stopColor="#3498db" />
                        <stop offset="90%" stopColor="#2980b9" />
                    </linearGradient>
                </defs>
                {/* Trục X hiển thị thời gian theo định dạng giờ:phút:giây */}
                <XAxis dataKey="time" stroke="#fff" tick={{ opacity:"0.7" }} axisLine={false} 
                    tickFormatter={(time) => new Date(time).toLocaleTimeString("vi-VN", {hour: "2-digit", minute: "2-digit", second: "2-digit"})} 
                />
                {/* Tooltip nổi với style trong suốt nhẹ */}
                <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.1)", border: "none", borderRadius: "8px", fontSize: "12px"}} 
                    labelFormatter={(time) => new Date(time).toLocaleTimeString("vi-VN", {hour: "2-digit", minute: "2-digit", second: "2-digit"})} 
                    position={{ y: 0 }} 
                />
                {/* Legend hiển thị tên loại dữ liệu */}
                <Legend iconType="none"  formatter={(value) => <strong style={{ fontWeight: 1500 ,opacity: 0.6, fontSize: 16 }}>{value}</strong>} />
                {/* Lưới nền nhẹ để dễ đọc dữ liệu */}
                <CartesianGrid stroke="rgba(255,255,255,0.1)" vertical={false} />
                <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" horizontal={false} />
                {/* Chỉ vẽ area tương ứng với cảm biến đang được hover chọn */}
                {sensor === "temp" && renderAreaWithMarkers(sensorData, "temp", "#ff7e5f", "colorTemp", "Nhiệt độ", "°C")}
                {sensor === "light" && renderAreaWithMarkers(sensorData, "light", "#f1c40f", "colorLight", "Ánh sáng", "Lux")}
                {sensor === "humi" && renderAreaWithMarkers(sensorData, "humi", "#3498db", "colorHumi", "Độ ẩm", "%")}
            </AreaChart>
        </ResponsiveContainer>
    )
}