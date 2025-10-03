import { Box, Avatar, Typography, Stack, IconButton, Tooltip } from "@mui/material";
import { GitHub, PictureAsPdf, Description, School, Email, Phone } from "@mui/icons-material";
import './styles.css';

// Trang hồ sơ cá nhân hiển thị thông tin liên hệ và liên kết tài nguyên
export default function Profile() {
  return (
    <Box className="profile-container">
      {/* Ảnh đại diện và tên sinh viên */}
      <Box className="profile-header">
        <Avatar
          alt="Nguyễn Năng Vương"
          src="src/assets/IMG_0158.JPG"
          className="profile-avatar"
        />
        <Typography variant="h4" className="profile-name">
          Nguyễn Năng Vương
        </Typography>
        <Typography variant="subtitle1" className="profile-subtitle">
          B22DCCN923
        </Typography>
      </Box>

      {/* Khối thông tin cá nhân chi tiết */}
      <Box className="profile-info">
        <Typography variant="h5" className="profile-section-title">
          Thông tin cá nhân
        </Typography>
        <Stack spacing={2} className="info-details">
          {/* Lớp chuyên ngành */}
          <Box className="info-row">
            <School className="info-icon" />
            <Typography className="info-text">
              Lớp: <span>D22HTTT06</span>
            </Typography>
          </Box>
          {/* Email liên hệ */}
          <Box className="info-row">
            <Email className="info-icon" />
            <Typography className="info-text">
              Email: <span>nam115533@gmail.com</span>
            </Typography>
          </Box>
          {/* Số điện thoại liên hệ */}
          <Box className="info-row">
            <Phone className="info-icon" />
            <Typography className="info-text">
              Liên hệ: <span>+84 705 646 392</span>
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Liên kết mạng xã hội và tài liệu dự án */}
      <Stack direction="row" spacing={3} justifyContent="center" className="social-container">
        <IconButton className="social-icon" href="https://github.com/nangvuong" target="_blank">
          <Tooltip title="Github">
            <GitHub />
          </Tooltip>
        </IconButton>
        <IconButton className="social-icon" href="https://drive.google.com/file/d/1fo_p7aLQj3f8PZ6_P53DaHqsc9-J_rCH/view?usp=sharing" target="_blank">
          <Tooltip title="Tài liệu mô tả">
            <PictureAsPdf />
          </Tooltip>
        </IconButton>
        <IconButton className="social-icon" href="https://documenter.getpostman.com/view/44358572/2sB3QCTtwn" target="_blank">
          <Tooltip title="API Documentation">
            <Description />
          </Tooltip>
        </IconButton>
      </Stack>
    </Box>
  );
}
