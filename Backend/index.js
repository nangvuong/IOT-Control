const express = require("express");
require("dotenv").config();
const cors = require("cors");

const client = require("./config/mqttConnect");
const dbConnect = require("./config/dbConnect");

const server = express();
const SensorRouter = require("./router/SensorRouter");
const DeviceRouter = require("./router/DeviceRouter");
const basicAuth = require("./middleware/basicAuth");

server.use(cors());
server.use(express.json());
server.disable("etag");
dbConnect();

server.use(basicAuth);

server.use("/sensor", SensorRouter);
server.use("/device", DeviceRouter);

server.get("/", (req, res) => {
    res.send({success: true});
})

server.listen(5007, () => {
    console.log("Server running on 5007");
})