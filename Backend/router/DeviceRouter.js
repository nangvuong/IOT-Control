// Khởi tạo router Express để cung cấp các endpoint điều khiển thiết bị.
const router = require("express").Router();
// Kết nối MQTT dùng để publish và subscribe thông điệp điều khiển thiết bị.
const client = require("../config/mqttConnect");
// UUID được dùng để gắn mã định danh cho mỗi yêu cầu điều khiển.
const { v4: uuidv4 } = require("uuid");
// Model lịch sử trạng thái thiết bị trong MongoDB.
const HistoryDevice = require("../model/HistoryDevice");

router.get ("/", async (req, res) => {
    try {
        // Lấy trạng thái mới nhất của từng thiết bị bằng cách sắp xếp giảm dần theo thời gian.
        const data = await HistoryDevice.aggregate([
            { $sort: { time: -1 } },
            { 
                $group: {
                    _id: "$device",
                    status: { $first: "$status" },
                    time: { $first: "$time" },
                } 
            }
        ]);

        // Trả về dạng { deviceId: booleanStatus } để client dễ tiêu thụ.
        const message = Object.fromEntries(
            data.map((item) => [item._id, item.status === "1"])
        );

        res.json({success: true, message: message});

    } catch (error) {
        // Nếu truy vấn lỗi, trả về trạng thái thất bại.
        res.json({success: false});
    }
})

router.post("/control", async (req, res) => {
    try {
        // Lấy thông tin thiết bị và trạng thái mong muốn từ body.
        const { device, status } = req.body;
        const id = uuidv4();
        const pubMessage = { id: id, [device] : status};

        // Gửi thông điệp điều khiển tới topic controlDevice.
        client.publish("controlDevice", JSON.stringify(pubMessage));
        
        const waitingPromise = new Promise ((resolve, reject) => {
            // Timeout tối đa 3 giây nếu không nhận được phản hồi.
            const timeOut = setTimeout(() => {
                client.removeListener("message", onMessage );
                resolve(false);
            }, 3000);

            const onMessage = (topic, payload, packet) => {
                // Bỏ qua bản tin retain để tránh xử lý lại dữ liệu cũ.
                if (packet.retain) return;
                if (topic === "responseDevice") {
                    try {
                        const response = JSON.parse(payload.toString());
                        // Kiểm tra phản hồi có khớp ID và trạng thái mong muốn hay không.
                        if (response.id === id && response[device] === status) {
                            clearTimeout(timeOut);
                            client.removeListener("message", onMessage);
                            resolve(true);
                        } else if (response.id === id && response[device] !== status) {
                            clearTimeout(timeOut);
                            client.removeListener("message", onMessage);
                            resolve(false);
                        }
                    } catch (error) {
                        clearTimeout(timeOut);
                        client.removeListener("message", onMessage);
                        resolve(false);
                    }
                }
            }
            client.on("message", onMessage);
        })

        const result = await waitingPromise;
        
        // Lưu lại lịch sử nếu thiết bị phản hồi thành công.
        if (result) await new HistoryDevice({ device, status }).save();
        res.json({ success: result })
    } catch (error) {
        res.status(500).json({ success: false });
    }
})

router.post("/", async (req, res) => {
    try {
        // Lấy thông tin lọc, phân trang từ body.
        const { date, device, page, rowsPerPage, status } = req.body;
       
        // Xây dựng các stage điều kiện tùy thuộc vào đầu vào.
        const deviceStage = device === "" ? {} : { device : device };
        const statusStage = status === "" ? {} : { status : status };
        const dateStage = {$expr : {
            $regexMatch : {
                input: {
                    $dateToString: {
                            format: "%Y/%m/%d %H:%M:%S",
                            date: "$time",
                            timezone: "Asia/Ho_Chi_Minh"
                        }
                },
                regex: date.trim(),
                options: "i"
            }
        }}
        const skipStage = {$skip: parseInt(page) * parseInt(rowsPerPage)};
        const limitStage ={$limit: parseInt(rowsPerPage)};
        const sortStage = {$sort : {time : -1}};

        const result = await HistoryDevice.aggregate([
            { $match : deviceStage },
            { $match : dateStage},
            { $match : statusStage },
            {
                $facet : {
                    // data: dữ liệu trong trang hiện tại.
                    data : [sortStage, skipStage, limitStage],
                    // total: tổng số bản ghi thỏa điều kiện.
                    total : [{$count : "count"}]
                }
            }
        ]);

        const history = result[0].data;
        const total = result[0].total.length > 0 ? result[0].total[0].count : 0;

        res.json({success: true, message: history, total: total});

    } catch (error) {
        // Nếu truy vấn lỗi, trả về 500 kèm danh sách rỗng.
        res.status(500).json({success: false, history: []});
    }
})


module.exports = router;