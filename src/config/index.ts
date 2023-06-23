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
export const COMPANY_NUMBER_PAGE = "company/number";
export const COMPANY_CONFIRM_PAGE = "company/confirm";
export const VIEW_COMPANY_INFORMATION_PAGE = "view-company-information";

// ROUTING PATHS
export const HOME_URL = `${REA_HOME_PAGE}`;
export const REGISTER_AN_EMAIL_ADDRESS_URL = `${HOME_URL}/`;

// Company routes
export const COMPANY_LOOKUP = "/company-lookup/search?forward=" + REA_HOME_PAGE + "/company/confirm?companyNumber={companyNumber}";

export const COMPANY_BASE_URL = `${REA_HOME_PAGE}/company`;
export const NUMBER_URL = "/number";
export const CONFIRM_URL = "/confirm";

export const COMPANY_NUMBER_URL = `${HOME_URL}/${COMPANY_NUMBER_PAGE}`;
export const COMPANY_CONFIRM_URL = `${HOME_URL}/${COMPANY_CONFIRM_PAGE}`;
export const VIEW_COMPANY_INFORMATION_URI = `${HOME_URL}/${VIEW_COMPANY_INFORMATION_PAGE}`;
