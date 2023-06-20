import { getEnvironmentValue } from "../utils/environment.value";

// APP CONFIGs
export const APPLICATION_NAME = "registered-email-address-web";
export const NODE_ENV = process.env.NODE_ENV;
export const PORT = getEnvironmentValue("PORT", "3000");
export const CHS_URL = getEnvironmentValue("CHS_URL", "http://chs.local");
export const CDN_HOST = getEnvironmentValue("CDN_HOST", "cdn.chs.local");
export const CDN_URL_CSS = getEnvironmentValue("CDN_URL_CSS", "/css");
export const CDN_URL_JS = getEnvironmentValue("CDN_URL_JS", "/js");
export const CACHE_SERVER = getEnvironmentValue("CACHE_SERVER", "redis");
export const COOKIE_SECRET = getEnvironmentValue("COOKIE_SECRET", "ChGovUk-XQrbf3sLj2abFxIY2TlapsJ");
export const COOKIE_DOMAIN = getEnvironmentValue("COOKIE_DOMAIN", "chs.local");
export const CHS_API_KEY = getEnvironmentValue("CHS_API_KEY", "chs.api.key");
export const COOKIE_NAME = getEnvironmentValue("COOKIE_NAME", "__SID");
export const DEFAULT_SESSION_EXPIRATION = getEnvironmentValue("DEFAULT_SESSION_EXPIRATION", "3600");
export const PIWIK_URL = getEnvironmentValue("PIWIK_URL", "https://matomo.platform.aws.chdev.org");
export const PIWIK_SITE_ID = getEnvironmentValue("PIWIK_SITE_ID", "24");
export const PIWIK_START_GOAL_ID = getEnvironmentValue("PIWIK_START_GOAL_ID", "3");
export const PIWIK_UPDATE_START_GOAL_ID = getEnvironmentValue("PIWIK_UPDATE_START_GOAL_ID", "10");
export const LOG_LEVEL = getEnvironmentValue("LOG_LEVEL", "DEBUG");

// TEMPLATES
export const HOME_PAGE = "home";
export const REA_HOME_PAGE = "/registered-email-address";
export const COMPANY_SEARCH_PAGE = "company-search";
export const VIEW_COMPANY_INFORMATION_PAGE = "view-company-information";
export const CONFIRM_COMPANY_PAGE = "confirm-company";

// ROUTING PATHS
export const HOME_URL = `${REA_HOME_PAGE}`;
export const REGISTER_AN_EMAIL_ADDRESS_URL = `${HOME_URL}/`;
export const COMPANY_NUMBER_URL = `${HOME_URL}/${COMPANY_SEARCH_PAGE}`;
export const VIEW_COMPANY_INFORMATION_URI = `${HOME_URL}/${VIEW_COMPANY_INFORMATION_PAGE}`;
export const CONFIRM_COMPANY_URL = `${HOME_URL}/${CONFIRM_COMPANY_PAGE}`;
