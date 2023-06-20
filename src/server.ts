import fs from "fs";
import http from "http";
import https from "https";
import logger from "./lib/Logger";
import app from "./app";
import * as config from "./config";

// start the HTTP server
const httpServer = http.createServer(app);
httpServer.listen(config.PORT, () => {
    console.log("HTTP Server started on Port : " + config.PORT);
}).on("error", err => {
    logger.error(`${err.name} - HTTP Server error: ${err.message} - ${err.stack}`);
});

export default httpServer;
