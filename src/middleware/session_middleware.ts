import { EnsureSessionCookiePresentMiddleware, SessionMiddleware, SessionStore } from "@companieshouse/node-session-handler";
import { COOKIE_DOMAIN, COOKIE_NAME, COOKIE_SECRET, DEFAULT_SESSION_EXPIRATION, NODE_ENV } from "../config";

const environmentsWithInsecureCookies = [
  "local"
];

export const createSessionMiddleware = (sessionStore: SessionStore) => SessionMiddleware({
  cookieDomain: COOKIE_DOMAIN,
  cookieName: COOKIE_NAME,
  cookieSecret: COOKIE_SECRET,
  cookieSecureFlag: NODE_ENV !== undefined && !environmentsWithInsecureCookies.includes(NODE_ENV),
  cookieTimeToLiveInSeconds: parseInt(DEFAULT_SESSION_EXPIRATION, 10),
}, sessionStore, true);

export const createEnsureSessionCookieSetMiddleware = () => EnsureSessionCookiePresentMiddleware({
  cookieName: COOKIE_NAME
});
