import "reflect-metadata";
import express, {NextFunction, Request, Response} from "express";
import nunjucks from "nunjucks";
import path from "path";
import Redis from 'ioredis';

import { SessionMiddleware, SessionStore } from "@companieshouse/node-session-handler";
import { CsrfProtectionMiddleware } from "@companieshouse/web-security-node";
import { logger } from "./utils/common/logger";
import router_dispatch from "./router_dispatch";
import {authentication_middleware} from "./middleware/authentication_middleware";
import {company_authentication_middleware} from "./middleware/company_authentication_middleware";
import cookieParser from "cookie-parser";
import {session_middleware} from "./middleware/session_middleware";
import { pageNotFound } from "./utils/error/error";

import {
  APPLICATION_NAME,
  CACHE_SERVER,
  CDN_URL_CSS,
  CDN_URL_JS,
  CDN_HOST,
  CHS_URL,
  COMPANY_BASE_URL,
  COOKIE_DOMAIN,
  COOKIE_NAME,
  COOKIE_SECRET,
  DEFAULT_SESSION_EXPIRATION,
  EMAIL_BASE_URL,
  HOME_URL,
  PIWIK_URL,
  PIWIK_SITE_ID,
  SIGN_OUT_URL
} from "./config";

const app = express();

app.set("views", [
  path.join(__dirname, "/views"),
  path.join(__dirname, "/node_modules/govuk-frontend"),
  path.join(__dirname, "/node_modules/@companieshouse")
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

njk.addGlobal("cdnUrlCss", CDN_URL_CSS);
njk.addGlobal("cdnUrlJs", CDN_URL_JS);
njk.addGlobal("cdnHost", CDN_HOST);
njk.addGlobal("chsUrl", CHS_URL);


njk.addGlobal("PIWIK_URL", PIWIK_URL);
njk.addGlobal("PIWIK_SITE_ID", PIWIK_SITE_ID);
njk.addGlobal("SERVICE_NAME", APPLICATION_NAME);
// If app is behind a front-facing proxy, and to use the X-Forwarded-* headers to determine the connection and the IP address of the client
app.enable("trust proxy");

// parse body into req.body
app.use(express.json());
app.use(express.urlencoded({extended: false}));

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
app.use(`${HOME_URL}*`, session_middleware);

// Login redirect for company and email paths and also signout page
app.use(cookieParser());
const userAuthRegex = new RegExp(`^((${COMPANY_BASE_URL})|(${EMAIL_BASE_URL}).+)|(${SIGN_OUT_URL})`);
app.use(userAuthRegex, authentication_middleware);

// Company Auth redirect
const companyAuthRegex = new RegExp(`^${EMAIL_BASE_URL}/.+`);
app.use(companyAuthRegex, company_authentication_middleware);

const cookieConfig = {
  cookieName: '__SID',
  cookieSecret: COOKIE_SECRET,
  cookieDomain: COOKIE_DOMAIN,
  cookieTimeToLiveInSeconds: parseInt(DEFAULT_SESSION_EXPIRATION, 10)
};
const sessionStore = new SessionStore(new Redis(`redis://${CACHE_SERVER}`));
app.use(SessionMiddleware(cookieConfig, sessionStore));

const csrfProtectionMiddleware = CsrfProtectionMiddleware({
  sessionStore,
  enabled: false,
  sessionCookieName: COOKIE_NAME
});
app.use(csrfProtectionMiddleware);

// Channel all requests through router dispatch
router_dispatch(app);

app.use(pageNotFound);

export default app;
