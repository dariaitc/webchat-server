const mongoose = require('mongoose');
const chalk = require('chalk');
const logger = require("../../../util/logger");
const connectToMongoDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/effectiveWebChat', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 50, // Increase pool size for multi-user scenarios
            serverSelectionTimeoutMS: 5000, // Keep retrying to connect for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            connectTimeoutMS: 10000, // Timeout after 10 seconds if cannot connect
        });

        logger
            .writeLog("app")
            .info(`${__filename}: Connected to MongoDB successfully.`);

        console.log(chalk.bgRed.white("Connected to MongoDB successfully."));
    } catch (error) {
        logger
            .writeLog("error")
            .error(`${__filename}: MongoDB connection failed: ${error}`);
        console.error(chalk.bgRed.white("MongoDB connection failed:"), error);
        process.exit(1); // Exit process if connection fails
    }
};

module.exports = connectToMongoDB;
