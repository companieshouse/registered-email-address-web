import { getEnvironmentValue } from "../utils/environment.value";

// APP CONFIGsweb
export const APPLICATION_NAME = "registered-email-address-";
export const NODE_ENV = process.env.NODE_ENV;
export const PORT = getEnvironmentValue("PORT", "3000");
export const CHS_URL = getEnvironmentValue("CHS_URL", "");
export const CDN_HOST = getEnvironmentValue("CDN_HOST", "cdn.chs.local");
export const CDN_URL_CSS = getEnvironmentValue("CDN_URL_CSS", "/css");
export const CDN_URL_JS = getEnvironmentValue("CDN_URL_JS", "/js");
export const COOKIE_SECRET = getEnvironmentValue("COOKIE_SECRET", "ybbj");
export const COOKIE_DOMAIN = getEnvironmentValue("COOKIE_DOMAIN", "chs.local");
export const DEFAULT_SESSION_EXPIRATION = getEnvironmentValue("DEFAULT_SESSION_EXPIRATION", "3600");
export const PIWIK_URL = getEnvironmentValue("PIWIK_URL", "/");
export const PIWIK_SITE_ID = getEnvironmentValue("PIWIK_SITE_ID", "24");
export const PIWIK_START_GOAL_ID = getEnvironmentValue("PIWIK_START_GOAL_ID", "3");
export const PIWIK_UPDATE_START_GOAL_ID = getEnvironmentValue("PIWIK_UPDATE_START_GOAL_ID", "10");
export const LOG_LEVEL = getEnvironmentValue("LOG_LEVEL", "info");
export const SERVICE_NAME = "Update a registered company email address";

// TEMPLATES
export const LANDING_PAGE = "landing";
export const SIGN_IN_PAGE = "sign-in";

// ROUTING PATHS
export const LANDING_URL = "/registered-email-address";
export const REGISTER_AN_EMAIL_ADDRESS_URL = LANDING_URL + "/";
export const SIGN_IN_URL = REGISTER_AN_EMAIL_ADDRESS_URL + SIGN_IN_PAGE;
