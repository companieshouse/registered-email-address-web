import { SessionMiddleware, SessionStore } from "@companieshouse/node-session-handler";
import Redis from "ioredis";
import { COOKIE_DOMAIN, COOKIE_NAME, COOKIE_SECRET } from "../config/index";

const redis = new Redis("redis");
const sessionStore = new SessionStore(redis);

export const sessionMiddleware = SessionMiddleware({
  cookieDomain: COOKIE_DOMAIN,
  cookieName: COOKIE_NAME,
  cookieSecret: COOKIE_SECRET,
  cookieSecureFlag: undefined,
  cookieTimeToLiveInSeconds: undefined,
}, sessionStore, true);
