import "reflect-metadata";
// import { Container } from 'inversify'
// import initContainer from './inversify.config'
import express, { Request, Response, NextFunction } from "express";
import nunjucks from "nunjucks";
import path from "path";
import logger from "./lib/Logger";
import routerDispatch from "./router.dispatch";
import * as config from "./config";
import { authenticationMiddleware } from "./middleware/authentication.middleware";
import cookieParser from "cookie-parser";
import { sessionMiddleware } from "./middleware/session.middleware";

const app = express();

app.set("views", [
    path.join(__dirname, "/views"),
    path.join(__dirname, "/node_modules/govuk-frontend"),
    path.join(__dirname, "/node_modules/govuk-frontend/components")
]);

const nunjucksLoaderOpts = {
    watch: process.env.NUNJUCKS_LOADER_WATCH !== "false",
    noCache: process.env.NUNJUCKS_LOADER_NO_CACHE !== "true"
};

const njk = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(app.get("views"),
        nunjucksLoaderOpts)
);

njk.express(app);
app.set("view engine", "njk");

// Serve static files
app.use(express.static(path.join(__dirname, "/../assets/public")));
// app.use("/assets", express.static("./../node_modules/govuk-frontend/govuk/assets"));

njk.addGlobal("cdnUrlCss", config.CDN_URL_CSS);
njk.addGlobal("cdnUrlJs", config.CDN_URL_JS);
njk.addGlobal("cdnHost", config.CDN_HOST);
njk.addGlobal("chsUrl", config.CHS_URL);

// If app is behind a front-facing proxy, and to use the X-Forwarded-* headers to determine the connection and the IP address of the client
app.enable("trust proxy");

// parse body into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Unhandled errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`${err.name} - appError: ${err.message} - ${err.stack}`);
    res.render("partials/error_500");
});

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
// Apply middleware
app.use(cookieParser());
app.use(`${config.HOME_URL}*`, sessionMiddleware);

// Login redirect
app.use(cookieParser());
const userAuthRegex = new RegExp(`^${config.HOME_URL}/.+`);
app.use(userAuthRegex, authenticationMiddleware);

// Channel all requests through router dispatch
routerDispatch(app);

export default app;
