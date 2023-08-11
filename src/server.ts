import http from "http";
import { logger }from "./utils/common/Logger";
import app from "./app";
import * as config from "./config";

// start the HTTP server
const server = http.createServer(app);
server.listen(config.PORT, () => {
  console.log("HTTP Server started on Port : " + config.PORT);
}).on("error", err => {
  logger.error(`${err.name} - HTTP Server error: ${err.message} - ${err.stack}`);
});

export default server;
