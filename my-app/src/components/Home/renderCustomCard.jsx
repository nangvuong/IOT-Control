import { Card, CardContent, Typography } from "@mui/material";

// Helper tạo thẻ MUI với gradient và nội dung tuỳ biến (cảm biến, biểu đồ, điều khiển)
const renderCustomCard = (title, icon, content, color1, color2, minWidth, minHeight) => (
    <Card
        sx={{
            // Gradient nền và hiệu ứng glassmorphism nhẹ
            background: `linear-gradient(135deg, ${color1}, ${color2})`,
            color: "white",
            borderRadius: "20px", 
            backdropFilter: "blur(12px)",
            p: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            minWidth: minWidth,
            minHeight: minHeight,
            transition: "background 0.8s cubic-bezier(0.4,0,0.2,1)" 
        }}
    >
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {/* Icon + tiêu đề truyền vào từ component cha */}
            {icon}
            <Typography variant="subtitle2" sx={{ opacity: 0.7, fontWeight: 600 }}>
            {title}
            </Typography>
        </div>
        {/* Nội dung tùy biến (giá trị cảm biến, bảng, biểu đồ,...) */}
        {content}
        </CardContent>
    </Card>
);

export default renderCustomCard;