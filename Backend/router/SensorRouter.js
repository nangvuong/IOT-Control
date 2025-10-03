// Khởi tạo router Express cho các API cảm biến.
const router = require("express").Router()
// Model dữ liệu cảm biến lưu trên MongoDB.
const DataSensor = require("../model/DataSensor")

router.get('/', async (req, res) => {
    try {
        // Lấy bản ghi cảm biến mới nhất để hiển thị realtime.
        const data = await DataSensor.findOne().sort({ time: -1 });
        res.json({success: true, message: data})
    } catch (error) {
        // Trường hợp lỗi truy vấn, trả về trạng thái thất bại.
        res.status(401).json({success: false})
    }
})

router.get('/chart', async (req, res) => {
    try {
        // Lấy 30 bản ghi mới nhất để vẽ biểu đồ, sau đó đảo lại cho đúng thứ tự thời gian.
        const data = await DataSensor.find().sort({ time : -1 }).limit(30);
        data.reverse();
        res.json({success: true, message: data});
    } catch (error) {
        // Nếu lỗi, trả về danh sách rỗng cho client.
        res.status(401).json({success: false, message: []});
    }
})

router.post("/", async (req, res) => {
    try {
        // Lấy thông tin lọc, sắp xếp, phân trang từ request.
        const { order, orderBy, key, value, page, rowsPerPage } = req.body;
        const sortStage = {$sort : {[orderBy] : order === "desc" ? -1 : 1}};

        let matchCondition = {};
        if (key === "all") {
            // Tìm kiếm toàn bộ: so sánh các giá trị số và thời gian chuyển chuỗi.
            matchCondition = {
                $or: [
                    { temp : Number(value) },
                    { light : Number(value) },
                    { humi: Number(value) },
                    { $expr: { $regexMatch: { 
                            input: { 
                                $dateToString: { 
                                    format: "%Y/%m/%d %H:%M:%S", 
                                    date: "$time",
                                    timezone: "Asia/Ho_Chi_Minh"
                                } 
                            }, 
                            regex: value.trim().replace(".", "\\."), 
                            options: "i" 
                            } 
                        } 
                    }
                ]
            }
        }
        else if (value.trim() === "") matchCondition = {}
        else if (key === "time") matchCondition = {
            // Lọc theo thời gian bằng regex với chuỗi định dạng thời gian.
            $expr : {
                $regexMatch: {
                    input: {
                        $dateToString: {
                            format: "%Y/%m/%d %H:%M:%S",
                            date: "$time",
                            timezone: "Asia/Ho_Chi_Minh"
                        }
                    },
                    regex: value.trim().replace(".", "\\."),
                    options: "i"
                }
            }
        } 
        else matchCondition = { [key] : Number(value) }
        
        // Thiết lập phân trang.
        const skipStage = { $skip : parseInt(page) * parseInt(rowsPerPage) };
        const limitStage = { $limit : parseInt(rowsPerPage) };

        const result = await DataSensor.aggregate([
            { $match : matchCondition },
            { 
                $facet : {
                    // data: danh sách dữ liệu trong trang hiện tại.
                    data: [sortStage, skipStage, limitStage],
                    // total: tổng số bản ghi thỏa điều kiện lọc.
                    total: [{$count: "count"}]
                } 
            }
        ])

        const data = result[0].data;
        const total = result[0].total.length > 0 ? result[0].total[0].count : 0;

        res.json({success: true, message: data, total: total});
    } catch (error) {
        // Thông báo lỗi cho client khi truy vấn thất bại.
        res.status(401).json({success: false, message: error})
    }
})


module.exports = router;