import { useState } from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeIcon from "@mui/icons-material/Home";
import ProfileIcon from "@mui/icons-material/Person";
import SensorsIcon from '@mui/icons-material/Sensors';
import HistoryIcon from "@mui/icons-material/History";
import './styles.css';
import { Link, useLocation } from "react-router-dom";
import { AppBar } from "@mui/material";

const pages = {
    '/profile': 1,
    '/data': 2,
    '/history': 3,
}

// Thanh điều hướng chính: hiển thị các trang và đồng bộ trạng thái theo URL hiện tại
export default function TopBar() {
    const page = useLocation();
    const path = page.pathname;
    const [value, setValue] = useState(pages[path] ?? 0);
    return (
        <AppBar position="fixed" elevation={0} sx={{ background: "transparent", p: 1 }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <BottomNavigation
                    className="custom-nav"
                    sx={{ 
                        width: "90%", 
                        borderRadius: "12px", 
                        boxShadow: "0px 4px 12px rgba(0,0,0,0.15)", 
                        maxWidth: 1200
                    }}
                    value={value}
                    onChange={(e, newValue) => setValue(newValue)}
                >
                    <BottomNavigationAction className="nav-action" label="Home" icon={<HomeIcon />} component={Link} to="/" />
                    <BottomNavigationAction className="nav-action" label="Profile" icon={<ProfileIcon />} component={Link} to="/profile" />
                    <BottomNavigationAction className="nav-action" label="Data Sensor" icon={<SensorsIcon />} component={Link} to="/data" />
                    <BottomNavigationAction className="nav-action" label="History Device" icon={<HistoryIcon />} component={Link} to="/history" />
                </BottomNavigation>
            </div>
        </AppBar>
    )
}
