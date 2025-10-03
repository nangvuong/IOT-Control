const mqtt = require("mqtt")
const dotenv = require("dotenv")
const DataSensor = require('../model/DataSensor')

dotenv.config();

const client = mqtt.connect(process.env.MQTT_URL, { username : process.env.MQTT_USER, password: process.env.MQTT_PASS });

client.on ("connect", () => {
    console.log("Connected to Mosquitto!!")

    client.subscribe("dataSensor", (err) => {
        if (!err) console.log("MQTT subscribe to dataSensor!");
        else console.error("Error subscribe to DataSensor!");
    });
    client.subscribe("responseDevice", (err) => {
        if (!err) console.log("MQTT subscribe to controlDevice!");
        else console.log("Error subscribe to controlDevice!")
    })
})

client.on ("message", async (topic, message, packet) => {
    if (packet.retain) return;
    if (topic === "dataSensor"){
        try {
            const data = JSON.parse(message.toString());
            const {temp, humi, light} = data;
            await new DataSensor({temp: temp, humi: humi, light: light}).save();
        } catch (error) {
            console.log("Error process message");
        }
    }
})

client.on ('error', (err) => {
    console.log("Error: ", err);
    client.end();
})
module.exports = client;