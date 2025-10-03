import { useState, useEffect, useRef } from "react";
import { Grid, Typography, Switch, List, ListItem, ListItemText, ListItemIcon, Snackbar, Alert, CircularProgress } from "@mui/material";
import { DeviceThermostat, LightMode, AcUnit, ShowChart, Lightbulb, BrightnessHigh, WindPower, MusicNote } from "@mui/icons-material";
import renderCustomCard from "./renderCustomCard";
import fetchGet from "../../lib/fetchGetData";
import fetchPost from "../../lib/fetchPostData";
import './styles.css'
import * as d3 from "d3-scale";
import * as d3color from "d3-color";
import Chart from "./Chart";
import MultiLineChart from "./MultiLineChart";

// Trang dashboard chính: hiển thị giá trị cảm biến hiện tại, biểu đồ lịch sử và điều khiển thiết bị IoT

export default function Home() {
  const [sensorData, setSensorData] = useState([{ time: 0, temp: 0, light: 0, humi: 0 }]);
  const [current, setCurrent] = useState({time: 0, temp: "--", light: "--", humi: "--"});
  const [sensor, setSensor] = useState("all");
  const currentRef = useRef(current);

  const [device, setDevice] = useState({ led: false, fan: false, music: false });
  const [enable, setEnable] = useState({ led: false, fan: false, music: false });

  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(true);
  const [message, setMessage] = useState("");

  // Nhiệt độ: 0°C (lạnh) → 40°C (nóng)
  // Thang màu cho các loại cảm biến giúp đổi màu theo giá trị hiện tại
  const tempScale = d3.scaleLinear()
    .domain([0, 5, 10, 15, 20, 25, 30, 35, 42, 50])
    .range(["#00c6ff", "#4dd0e1", "#81ecec", "#ffeaa7", "#f9ca24", "#f6b93b", "#e67e22", "#e17055", "#d63031", "#b71540"])
    .clamp(true);

  // Ánh sáng: 0 lux (tối) → 10000 lux (chói gắt)
  const lightScale = d3.scaleLinear()
  .domain([0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4250, 5000])
  .range(["#2c3e50", "#34495e", "#7f8c8d", "#bdc3c7", "#f1c40f", "#f39c12", "#e67e22", "#e74c3c", "#fdfefe", "#ffffff"])
  .clamp(true);


  // Độ ẩm: 0% (khô) → 100% (ẩm ướt)
  const humiScale = d3.scaleLinear()
    .domain([0, 10, 20, 30, 40, 50, 60, 70, 85, 100])
    .range(["#fdfcdc", "#f6f9d4","#d1ecff", "#a8dadc", "#90e0ef", "#48cae4", "#00b4d8", "#0077b6", "#023e8a", "#03045e"])
    .clamp(true);


  // Lấy 2 màu gradient từ thang màu ứng với giá trị cảm biến
  const getGradient = (scale, value) => {
    if (value === "--") return ["#bdc3c7", "#95a5a6"];
    const base = d3color.hsl(scale(value)); // chuyển sang HSL để dễ chỉnh sáng/tối
    const darker = base.darker(1).formatHex(); // tối hơn một nấc
    return [base.formatHex(), darker];
  }

  useEffect(() => {
  // Lấy số liệu cảm biến mới nhất để cập nhật phần hiển thị hiện tại và thêm vào lịch sử
  const fetchCurrent = async () => {
      try {
        const response = await fetchGet("/sensor");
        const { time } = response.message;
        if (response.success && time !== currentRef.current.time) {
          currentRef.current = response.message;
          setCurrent(response.message);
          setSensorData(prev => [...prev, response.message].slice(-30));
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchCurrent();

  // Lấy dữ liệu lịch sử ban đầu cho biểu đồ tuyến và biểu đồ 3 đường
  const fetchChart = async () => {
      try {
        const response = await fetchGet("/sensor/chart");
        if (response.success && response.message.length !== 0) setSensorData(response.message);
      } catch (error) {
        console.error(error);
      }
    }
    fetchChart();

  // Lấy trạng thái các thiết bị để đồng bộ công tắc điều khiển
  const fetchDevice = async () => {
      try {
        const response = await fetchGet("/device");
        if (response.success) {
          setDevice(response.message);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchDevice();

    const interval = setInterval(fetchCurrent, 2000);
    return () => clearInterval(interval);
  }, [])

  // Gửi yêu cầu bật/tắt thiết bị, hiển thị snackbar phản hồi và rollback nếu thất bại
  const handleSwitch = async ( deviceName, status ) => {
    try {
      setEnable((prev) => ({...prev, [deviceName]: true}));
      setDevice((prev) => ({...prev, [deviceName]: status}));
      const request = { device: deviceName, status: status ? "1" : "0" };
      
      const response = await fetchPost("/device/control", {
        method: "POST",
        body: JSON.stringify(request),
        headers: { "Content-Type": "application/json" }
      });

      setMessage((status ? "Bật" : "Tắt") + (response.success ? " thành công!" : " thất bại!!"));
      setSuccess(response.success);
      setOpen(true)

      if (!response.success) setDevice((prev) => ({...prev, [deviceName]: !status}) );
      setEnable((prev) => ({...prev, [deviceName]: false}));
    } catch (error) {
      console.error(error);
      setSuccess(false);
      setOpen(true);
      setDevice((prev) => ({...prev, [deviceName]: !status}));
      setEnable((prev) => ({...prev, [deviceName]: false}));
    }
  } 

  // Card cảm biến
  const renderSensorCard = (title, icon, value, unit, color1, color2, minWidth) =>
    renderCustomCard(
      title,
      icon,
      <Typography variant="h2" sx={{ fontWeight: "bold", lineHeight: 1 }}>
        {value}
        {unit}
      </Typography>,
      color1,
      color2,
      minWidth
    );

  return (
    <Grid container spacing={2} p={1} justifyContent="center" >
      {/* Container 1: 3 cảm biến */}
      <Grid container spacing={2} p={1} justifyContent="center">
        <Grid item xs={12} md={4}>
          <div onMouseEnter={() => setSensor("temp")} onMouseLeave={() => setSensor("all")}>
            {renderSensorCard("NHIỆT ĐỘ", <DeviceThermostat fontSize="small" />, current.temp, "°C", ...getGradient(tempScale, current.temp), 300)}
          </div>
        </Grid>
        <Grid item xs={12} md={4}>
          <div onMouseEnter={() => setSensor("light")} onMouseLeave={() => setSensor("all")}>
            {renderSensorCard("ÁNH SÁNG", <LightMode fontSize="small" />, current.light, " lux", ...getGradient(lightScale, current.light), 300)}
          </div>
        </Grid>
        <Grid item xs={12} md={4}>
          <div onMouseEnter={() => setSensor("humi")} onMouseLeave={() => setSensor("all")}>
            {renderSensorCard("ĐỘ ẨM", <AcUnit fontSize="small" />, current.humi, "%", ...getGradient(humiScale, current.humi), 300)}
          </div>
        </Grid>
      </Grid>

      {/* Container 2: Biểu đồ + Điều khiển */}
      <Grid container spacing={4} p={1} justifyContent="center">
        <Grid item xs={12} md={6}>
          {renderCustomCard(
            "Biểu đồ thông số",
            <ShowChart fontSize="small" />,
            sensor === "all" ? MultiLineChart(sensorData) : Chart(sensor, sensorData)
            ,
            "#6a11cb",
            "#2575fc",
            600,
            350
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          {renderCustomCard(
            "Điều khiển thiết bị",
            <BrightnessHigh fontSize="small" />,
            <List>
              <ListItem>
                <ListItemIcon>
                  <Lightbulb sx={{ color: device.led ? "warning.main" : "" }} />
                </ListItemIcon>
                <ListItemText primary={<Typography variant="subtitle2" sx={{ opacity: 0.7, fontWeight: 800 }}>Đèn</Typography>} />
                <Switch color="warning" checked={device.led} disabled={enable.led} onChange={() => handleSwitch("led", !device.led)}/>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WindPower sx={{ color: device.fan ? "primary.main" : "" }}/>
                </ListItemIcon>
                <ListItemText primary={<Typography variant="subtitle2" sx={{ opacity: 0.7, fontWeight: 800 }}>Quạt</Typography>} />
                <Switch color="primary" checked={device.fan} disabled={enable.fan} onChange={() => handleSwitch("fan", !device.fan)} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <MusicNote sx={{ color: device.music ? "secondary.main" : "" }}/>
                </ListItemIcon>
                <ListItemText primary={<Typography variant="subtitle2" sx={{ opacity: 0.7, fontWeight: 800 }}>Nhạc</Typography>} />
                <Switch color="secondary" checked={device.music} disabled={enable.music} onChange={() => handleSwitch("music", !device.music)} />
              </ListItem>
            </List>,
            "#11998e",
            "#38ef7d",
            330,
            375
          )}
        </Grid>
      </Grid>
      <Snackbar open={open} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} sx={{mb: 10 , mr: 18}} autoHideDuration={3000} onClose={() => setOpen(false)} >
        <Alert onClose={() => setOpen(false)} severity={success ? "success" : "warning"} variant="filled" sx={{ width: "100%" }}> {message} </Alert>
      </Snackbar>
    </Grid>
  );
}
