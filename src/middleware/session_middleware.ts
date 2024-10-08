import { SessionMiddleware, SessionStore } from "@companieshouse/node-session-handler";
import { COOKIE_DOMAIN, COOKIE_NAME, COOKIE_SECRET, DEFAULT_SESSION_EXPIRATION } from "../config";

export const createSessionMiddleware = (sessionStore: SessionStore) => SessionMiddleware({
  cookieDomain: COOKIE_DOMAIN,
  cookieName: COOKIE_NAME,
  cookieSecret: COOKIE_SECRET,
  cookieSecureFlag: undefined,
  cookieTimeToLiveInSeconds: parseInt(DEFAULT_SESSION_EXPIRATION, 10),
}, sessionStore, true);
