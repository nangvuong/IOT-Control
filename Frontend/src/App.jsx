import './App.css'
import TopBar from './components/TopBar/TopBar'
import { Container, Toolbar } from '@mui/material'
import Home from './components/Home/Home'
import DataSensor from './components/DataSensor/DataSensor'
import Profile from './components/Profile/Profile'
import ActionHistory from './components/ActionHistory/ActionHistory'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Ứng dụng gốc: cấu hình router và bao bọc layout với thanh điều hướng cố định ở trên cùng

function App() {
  return (
    <Router>
      <TopBar />
      <Toolbar />
      <Container fixed>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/data" element={<DataSensor />} />
            <Route path="/history" element={<ActionHistory />} />
        </Routes>   
      </Container>
    </Router>
  )
}

export default App
