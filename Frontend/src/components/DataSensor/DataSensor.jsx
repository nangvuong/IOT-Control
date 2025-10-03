import { Box, Paper, TableBody, TableCell, TableContainer, TableHead, TableRow, Table, Grid, TextField, Button, TablePagination, Select, MenuItem, IconButton, Tooltip, TableSortLabel, Typography } from "@mui/material";
import { useState } from "react";
import "./styles.css"
import { useEffect } from "react";
import { SearchOff, Refresh } from "@mui/icons-material";
import fetchPost from "../../lib/fetchPostData";

// Trang danh sách dữ liệu cảm biến: hỗ trợ sắp xếp, tìm kiếm và sao chép nhanh giá trị
export default function DataSensor () {

  // Chuyển timestamp từ server sang chuỗi YYYY/MM/DD HH:mm:ss để hiển thị
  const formatDateTime = (time) => {
      const day = new Date(time);
      const parse = (n) => n.toString().padStart(2, "0");
      return `${day.getFullYear()}/${parse(day.getMonth() + 1)}/${parse(day.getDate())} ` 
          + `${parse(day.getHours())}:${parse(day.getMinutes())}:${parse(day.getSeconds())}`
  }

  // State chính cho bảng và các bộ lọc tìm kiếm
  const [sensorData, setDataSensor ] = useState([]);
  const [value, setValue] = useState("");
  const [key, setKey] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [total, setTotal] = useState(0);
  
  // Biến kích hoạt refetch thủ công và cấu hình sắp xếp cho từng cột
  const [count, setCount] = useState(0);
  const [orderBy, setOrderBy] = useState();
  const [order, setOrder] = useState("desc");

  // Tải dữ liệu mỗi khi bộ lọc, sắp xếp hoặc phân trang thay đổi
  useEffect(() => {
    const fetch = async () => {
      try {
        const request = { orderBy : orderBy ? orderBy : "time", order, key, value, page, rowsPerPage }
        const response = await fetchPost("/sensor", { body: JSON.stringify(request) });
        if (response.success){ 
          const data = response.message.map((item) => ({
            ...item,
            time : formatDateTime(item.time)
          }));
          setDataSensor(data);
          setTotal(response.total);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetch();
  }, [count, rowsPerPage, page, order, orderBy, key]);

  // Đảo thứ tự sắp xếp khi người dùng click vào tiêu đề cột
  const handleSort = async (sensor) => {
    const isAsc = sensor === orderBy && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(sensor);
  }
  
  // Handler hỗ trợ TablePagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box className="data-sensor-container">
      {/* Thanh công cụ lọc dữ liệu và nút tìm kiếm */}
      <Paper className="search-bar" >
        <Grid container  spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12} sm="auto">
            <Select
              displayEmpty
              value={key}
              size="small"
              fullWidth
              style={{ minWidth: 140, borderRadius: 12 }}
              className="device-select"
              MenuProps={{
                classes: { paper: "custom-menu" } // override menu
              }}
              onChange={(e) => setKey(e.target.value)}
            >
              <MenuItem value="all" ><span style={{fontWeight:"bold", fontSize:"0.95rem"}}>Tất cả</span></MenuItem>
              <MenuItem value="light"><span style={{fontWeight:"bold", fontSize:"0.95rem"}}>Ánh sáng</span></MenuItem>
              <MenuItem value="temp"><span style={{fontWeight:"bold", fontSize:"0.95rem"}}>Nhiệt độ</span></MenuItem>
              <MenuItem value="humi"><span style={{fontWeight:"bold", fontSize:"0.95rem"}}>Độ ẩm</span></MenuItem>
              <MenuItem value="time"><span style={{fontWeight:"bold", fontSize:"0.95rem"}}>Thời gian</span></MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} sm="auto">
            <TextField 
              id="outlined"
              placeholder="Tìm thời gian, giá trị cảm biến..."
              size="small"
              sx={{background: "white"}}
              fullWidth
              className="search-input"
              onChange={(e) => setValue(e.target.value)}
              
            />
          </Grid>
          <Grid item> 
            <Button 
              variant="contained" 
              className="search-btn" 
              onClick={() => setCount(count + 1)}
            >
              Tìm kiếm
            </Button> 
          </Grid>
        </Grid>
      </Paper>
      
      <TableContainer component={Paper} className="data-sensor-table">
        {/* Bố trí thanh phân trang và nút làm mới bên phải */}
        <Box display="flex" alignItems="center" justifyContent="flex-end">
          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPageOptions={[5, 25, 50, 75, 100]}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowPerPage}
            labelRowsPerPage="Số dòng:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} trên ${count !== -1 ? count : `nhiều hơn ${to}`}`
            }
          />
          <IconButton onClick={() => setCount(count + 1)} color="primary" sx={{ ml: 1, mt: "2px" }}  >
            <Tooltip title="Làm mới" >
              <Refresh fontSize="small"  />
            </Tooltip>
          </IconButton>
        </Box>
        <Table>
          <TableHead>
            {/* Header bảng có thể click để sắp xếp */}
            <TableRow className="table-header">
              <TableCell>TT</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "temp"}
                  direction={orderBy === "temp" ? order : "asc"}
                  onClick={() => handleSort("temp")}
                >
                  NHIỆT ĐỘ (°C)
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "light"}
                  direction={orderBy === "light" ? order : "asc"}
                  onClick={() => handleSort("light")}
                >
                  ÁNH SÁNG (LUX)
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "humi"}
                  direction={orderBy === "humi" ? order : "asc"}
                  onClick={() => handleSort("humi")}
                >
                  ĐỘ ẨM (%)
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "time"}
                  direction={orderBy === "time" ? order : "asc"}
                  onClick={() => handleSort("time")}
                >
                  THỜI GIAN
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Mỗi hàng thể hiện một bản ghi cảm biến, click để copy giá trị */}
            {sensorData
              .map((row, index) => (
              <TableRow key={row._id} className="table-row">
                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell onClick={() => navigator.clipboard.writeText(row.temp)}>
                  <Tooltip title="Nhấn để sao chép">
                    <span>{row.temp}</span>
                  </Tooltip>
                </TableCell>
                <TableCell onClick={() => navigator.clipboard.writeText(row.light)}>
                  <Tooltip title="Nhấn để sao chép">
                    <span>{row.light}</span>
                  </Tooltip>
                </TableCell>
                <TableCell onClick={() => navigator.clipboard.writeText(row.humi)}>
                  <Tooltip title="Nhấn để sao chép">
                    <span>{row.humi}</span>
                  </Tooltip>
                </TableCell>
                <TableCell onClick={() => navigator.clipboard.writeText(row.time)}>
                  <Tooltip title="Nhấn để sao chép">
                    <span>{row.time}</span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {sensorData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {/* Trạng thái hiển thị khi không có bản ghi phù hợp */}
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
