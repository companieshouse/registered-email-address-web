import fs from "fs";
import http from "http";
import https from "https";
import logger from "./lib/Logger";
import app from "./app";

// start the HTTP server
const httpServer = http.createServer(app);
// set NODE_PORT in the corresponding docker-chs-development yaml file.
httpServer.listen(process.env.NODE_PORT, () => {
    console.log(`Server started at: http://localhost:${process.env.NODE_PORT}`);
}).on("error", err => {
    logger.error(`${err.name} - HTTP Server error: ${err.message} - ${err.stack}`);
});

export default httpServer;
