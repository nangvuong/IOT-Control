const mongoose = require("mongoose");
const dotenv = require("dotenv");

async function dbConnect() {
    await mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("Connected to Database " + mongoose.connection.name))
    .catch((error) => console.error(error));
}

module.exports = dbConnect;