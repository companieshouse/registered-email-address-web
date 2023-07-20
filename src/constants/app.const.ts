import * as config from "../config/index";

export const REA_SESSION_KEY = "registered-email-address";
export const APP_NAME = "registered-email-address-web";
export const COMPANY_NOT_ACTIVE_ERROR_MSG = "The company is not currently active and cannot be closed.";
export const PAGE_TITLE_SUFFIX = `${config.APPLICATION_NAME} - GOV.UK`;
export const BANNER_FEEDBACK_LINK = "https://www.smartsurvey.co.uk/s/closing-a-company-feedback";
export const CONFIRMATION_FEEDBACK_LINK = "https://www.smartsurvey.co.uk/s/closing-a-company-confirmation";

// session.extra_data
export const COMPANY_PROFILE = "companyProfile";
export const COMPANY_NUMBER = "companyNumber";
export const REGISTERED_EMAIL_ADDRESS = "registeredEmailAddress";
export const NEW_EMAIL_ADDRESS = "newEmailAddress";
export const INVALID_COMPANY_REASON = "invalidCompanyReason";
export const RETURN_URL = 'returnToUrl';
export const SUBMISSION_ID = "submissionID";
export const USER_EMAIL = "userEmail";


export const INVALID_COMPANY_NUMBER = "You must enter a valid company number";
export const THERE_IS_A_PROBLEM = "There is a problem";
export const NO_EMAIL_ADDRESS_FOUND = "No email address for company number";
export const EMAIL_ADDRESS_INVALID = "Enter an email address in the correct format, like name@example.com";
export const NO_EMAIL_ADDRESS_SUPPLIED = "Enter the registered email address";
export const TRANSACTION_CREATE_ERROR = "Unable to create a transaction record for company ";
export const TRANSACTION_CLOSE_ERROR = "Unable to close a transaction record for company ";
export const CONFIRM_EMAIL_CHANGE_ERROR = "You need to accept the registered email address statement";
export const FAILED_TO_CREATE_REA_ERROR = "Failed to create Registered Email Address Resource";
export const FAILED_TO_FIND_RETURN_URL = "Unable to find return page";
export const PRIVATE_API_ERROR = "You cannot set both api key and oauth token to create a client. Please use one or the other";
