import { Box, Paper, Tooltip, TableBody, TableCell, TableContainer, TableHead, TableRow, Table, Grid, TextField, Select, MenuItem, Typography, TablePagination, Button, Chip } from "@mui/material";
import { useState, useEffect } from "react";
import { SearchOff } from "@mui/icons-material";
import "./styles.css"
import fetchPost from "../../lib/fetchPostData";

// Trang lịch sử điều khiển: cho phép lọc/bộ lọc và phân trang theo thiết bị, trạng thái
export default function ActionHistory () {
    // Định dạng lại timestamp từ backend sang chuỗi YYYY/MM/DD HH:mm:ss
    const formatDateTime = (time) => {
        const day = new Date(time);
        const parse = (n) => n.toString().padStart(2, "0");
        return `${day.getFullYear()}/${parse(day.getMonth() + 1)}/${parse(day.getDate())} ` 
            + `${parse(day.getHours())}:${parse(day.getMinutes())}:${parse(day.getSeconds())}`
    }
    // Danh sách lịch sử đã lọc + các biến điều kiện tìm kiếm
    const [history, setHistory] = useState([]);
    const [value, setValue] = useState("");
    const [status, setStatus] = useState("");
    const nameDevice = {"led": "Đèn", "fan": "Quạt", "music": "Nhạc"}

    const [device, setDevice] = useState("");

    // Trạng thái phân trang và tổng số bản ghi
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [count, setCount] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Gọi API mỗi khi bộ lọc hoặc phân trang thay đổi
    useEffect (() => {
        const fetchHistory = async () => {
            try {
                const request = { date: value, device, rowsPerPage, page, status };
                const response = await fetchPost("/device", { body: JSON.stringify(request) });
                if (response.success) {
                    // Chuyển từng record thành chuỗi thời gian đã định dạng
                    const data = response.message.map((item) => ({...item, time: formatDateTime(item.time)}));
                    setHistory(data);
                    setTotal(response.total);
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchHistory();
    }, [device, rowsPerPage, page, count, status]);

    return (
    <Box className="data-sensor-container">
        {/* Khối bộ lọc điều kiện tìm kiếm */}
        <Paper className="search-bar" >
            <Grid container spacing={2} alignItems="center" justifyContent="center">
                <Grid item xs={12} sm="auto">
                    <Select
                        displayEmpty
                        value={device}
                        size="small"
                        fullWidth
                        style={{ minWidth: 140, borderRadius: 12 }}
                        className="device-select"
                        MenuProps={{
                            classes: { paper: "custom-menu" } // override menu
                        }}
                        onChange={ (e) => setDevice(e.target.value) }
                    >
                        <MenuItem value=""><Typography sx={{fontWeight:"bold", fontSize:"0.95rem"}}>Thiết bị</Typography></MenuItem>
                        <MenuItem value="led"><Typography sx={{fontWeight:"bold", fontSize:"0.95rem"}}>Đèn</Typography></MenuItem>
                        <MenuItem value="fan"><Typography sx={{fontWeight:"bold", fontSize:"0.95rem"}}>Quạt</Typography></MenuItem>
                        <MenuItem value="music"><Typography sx={{fontWeight:"bold", fontSize:"0.95rem"}}>Nhạc</Typography></MenuItem>
                    </Select>
                </Grid>

                <Grid item xs={12} sm="auto">
                    <Select
                        displayEmpty
                        value={status}
                        size="small"
                        fullWidth
                        style={{ minWidth: 140, borderRadius: 12 }}
                        className="device-select"
                        MenuProps={{
                            classes: { paper: "custom-menu" } // override menu
                        }}
                        onChange={ (e) => setStatus(e.target.value) }
                    >
                        <MenuItem value=""><Typography sx={{fontWeight:"bold", fontSize:"0.95rem"}}>Trạng thái</Typography></MenuItem>
                        <MenuItem value="1"><Typography sx={{fontWeight:"bold", fontSize:"0.95rem"}} color="success.main">Bật</Typography></MenuItem>
                        <MenuItem value="0"><Typography sx={{fontWeight:"bold", fontSize:"0.95rem"}} color="error.main">Tắt</Typography></MenuItem>
                    </Select>
                </Grid>
                
                <Grid item xs={12} sm="auto">
                    <TextField 
                        id="outlined"
                        size="small"
                        placeholder="Tìm theo thời gian"
                        sx={{background: "white"}}
                        fullWidth
                        className="search-input"
                        onChange={ (e) => setValue(e.target.value) }
                    />
                </Grid>
                <Grid item> 
                    <Button 
                        variant="contained" 
                        className="search-btn"
                        onClick={ () => setCount(count + 1) }
                    >
                    Tìm kiếm
                    </Button> 
                </Grid>
            </Grid>
        </Paper>
        <TableContainer component={Paper} className="data-sensor-table">
            {/* Thanh phân trang đặt trên đầu bảng */}
            <TablePagination
                component="div"
                count={total}
                page={page}
                rowsPerPageOptions={[5, 10, 25, 50]}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowPerPage}
                labelRowsPerPage={"Số dòng:"}
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} trên ${count !== -1 ? count : `nhiều hơn ${to}`}`}
            >
            </TablePagination>
            <Table>
                <TableHead>
                    {/* Header bảng: TT, thiết bị, trạng thái, thời gian */}
                    <TableRow className="table-header">
                        <TableCell>TT</TableCell>
                        <TableCell>THIẾT BỊ</TableCell>
                        <TableCell>TRẠNG THÁI</TableCell>
                        <TableCell>THỜI GIAN</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {history
                    .map((row, index) => (
                    // Mỗi dòng hiển thị thông tin, kèm tooltip sao chép thời gian
                    <TableRow key={row._id} className="table-row">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{nameDevice[row.device]}</TableCell>
                        <TableCell>{row.status === "1" ? <Chip label="Bật" color="success"/> : <Chip label="Tắt" color="error"/>}</TableCell>
                        <TableCell onClick={() => navigator.clipboard.writeText(row.time)}>
                            <Tooltip title="Nhấn để sao chép">
                                <span>{row.time}</span>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                    ))}
                    {history.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} align="center">
                            {/* Trạng thái rỗng khi không có dữ liệu thỏa điều kiện */}
                            <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                                <SearchOff fontSize="large" color="disabled" />
                                <Typography variant="subtitle1" color="textSecondary">
                                    Không tìm thấy dữ liệu
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Hãy thử thay đổi bộ lọc hoặc làm mới lại bảng.
                                </Typography>
                            </Box>
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
        
    </Box>
  );
}

