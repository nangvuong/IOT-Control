const mongoose = require("mongoose");

const HistoryDeviceSchema = new mongoose.Schema({
    time: {type: Date, default: Date.now, index: true},
    device: {type: String, required: true},
    status: {type: String, required: true}
})

module.exports = mongoose.models.HistoryDevice || mongoose.model("HistoryDevice", HistoryDeviceSchema)