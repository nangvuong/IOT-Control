const mongoose = require("mongoose")

const DataSensorSchema = new mongoose.Schema({
    time: {type: Date, default: Date.now, index: true},
    temp: {type: Number, required: true},
    light: {type: Number, required: true},
    humi: {type: Number, required: true}
})

module.exports = mongoose.models.DataSensor || mongoose.model("DataSensor", DataSensorSchema);