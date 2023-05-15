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

const nunjucksLoaderOpts = {
    watch: process.env.NUNJUCKS_LOADER_WATCH !== "false",
    noCache: process.env.NUNJUCKS_LOADER_NO_CACHE !== "true"
};

const njk = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(app.get("views"),
        nunjucksLoaderOpts)
);

// set up the template engine
const nunjucksEnv = nunjucks.configure([
    "views",
    "views/update",
    "node_modules/govuk-frontend/",
    "node_modules/govuk-frontend/govuk/components",
], {
    autoescape: true,
    express: app,
});
   nunjucksEnv.addGlobal("CDN_HOST", config.CDN_HOST);
   nunjucksEnv.addGlobal("SERVICE_NAME", config.APPLICATION_NAME);
// //   nunjucksEnv.addGlobal("OE_CONFIGS", config);
// //   nunjucksEnv.addGlobal("ERROR_MESSAGES", ErrorMessages);
// //   nunjucksEnv.addGlobal("COUNTRY_FILTER", countryFilter );
// //   nunjucksEnv.addGlobal("CREATE_CHANGE_LINK", createChangeLinkConfig);
// //   nunjucksEnv.addGlobal("SUMMARY_LIST_LINK", createSummaryListLink);
// //   nunjucksEnv.addGlobal("PIWIK_URL", config.PIWIK_URL);
// //   nunjucksEnv.addGlobal("PIWIK_SITE_ID", config.PIWIK_SITE_ID);
// //   nunjucksEnv.addGlobal("PIWIK_START_GOAL_ID", config.PIWIK_START_GOAL_ID);
// //   nunjucksEnv.addGlobal("PIWIK_UPDATE_START_GOAL_ID", config.PIWIK_UPDATE_START_GOAL_ID);
// //   nunjucksEnv.addGlobal("MATOMO_ASSET_PATH", `//${config.CDN_HOST}`);

njk.express(app);
app.set("view engine", "njk");

// Serve static files
//app.use("/assets", express.static("./../node_modules/govuk-frontend/govuk/assets"));
//app.use(express.static("./../node_modules/govuk-frontend/govuk"));

njk.addGlobal("chsUrl", config.CHS_URL);
njk.addGlobal("cdnUrlCss", config.CDN_URL_CSS);
njk.addGlobal("cdnUrlJs", config.CDN_URL_JS);
njk.addGlobal("cdnHost", config.CDN_HOST);
njk.addGlobal("logLevel", config.LOG_LEVEL);

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