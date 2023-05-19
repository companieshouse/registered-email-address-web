import express, { Request, Response } from "express";
import nunjucks from "nunjucks";
import path from "path";
import logger from "./lib/Logger";
import routerDispatch from "./router.dispatch";
import * as config from "./config";

const app = express();
// parse body into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const viewPath = path.join(__dirname, "/views");
app.set("views", viewPath);

// set up the template engine
const nunjucksEnv = nunjucks.configure([
    "views",
    "views/update",
    "node_modules/govuk-frontend/",
    "node_modules/govuk-frontend/govuk/components"
], {
    autoescape: true,
    express: app
});
nunjucksEnv.addGlobal("CDN_HOST", config.CDN_HOST);
nunjucksEnv.addGlobal("SERVICE_NAME", config.SERVICE_NAME);

app.set("view engine", "html");

// If app is behind a front-facing proxy, and to use the X-Forwarded-* headers to determine the connection and the IP address of the client
app.enable("trust proxy");

// Unhandled errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(`${err.name} - appError: ${err.message} - ${err.stack}`);
});

// Channel all requests through router dispatch
routerDispatch(app);

// Unhandled exceptions
process.on("uncaughtException", (err: any) => {
    logger.error(`${err.name} - uncaughtException: ${err.message} - ${err.stack}`);
    process.exit(1);
});

// Unhandled promise rejections
process.on("unhandledRejection", (err: any) => {
    logger.error(`${err.name} - unhandledRejection: ${err.message} - ${err.stack}`);
    process.exit(1);
});

export default app;
