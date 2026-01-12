const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Error:", error);
        throw error;
    }
};

module.exports = connectDB;
