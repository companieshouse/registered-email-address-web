import * as config from "../config/index";

export const REA_SESSION_KEY: string =  "registered-email-address";
export const APP_NAME: string =  "registered-email-address-web";
export const COMPANY_NOT_ACTIVE_ERROR_MSG: string =  "The company is not currently active and cannot be closed.";
export const PAGE_TITLE_SUFFIX: string =  `${config.APPLICATION_NAME} - GOV.UK`;
export const BANNER_FEEDBACK_LINK: string =  "https://www.smartsurvey.co.uk/s/closing-a-company-feedback";
export const CONFIRMATION_FEEDBACK_LINK: string =  "https://www.smartsurvey.co.uk/s/closing-a-company-confirmation";

// session.extra_data
export const COMPANY_PROFILE: string =  "companyProfile";
export const COMPANY_NUMBER: string =  "companyNumber";
export const REGISTERED_EMAIL_ADDRESS: string =  "registeredEmailAddress";
export const NEW_EMAIL_ADDRESS: string =  "newEmailAddress";
export const INVALID_COMPANY_REASON: string =  "invalidCompanyReason";
export const RETURN_URL: string =  'returnToUrl';
export const SUBMISSION_ID: string =  "submissionID";
export const TRANSACTION_DESCRIPTION_ID: string =  "transactionDescription";

export const USER_EMAIL: string =  "userEmail";

export const WHAT_IS_COMPANY_NUMBER: string = "What is the company number?";
export const THERE_IS_A_PROBLEM_ERROR: string =  "There is a problem";
export const INVALID_COMPANY_NUMBER: string =  "You must enter a valid company number";
export const SERVICE_UNAVAILABLE: string =  "Service unavailable";
export const SOMETHING_HAS_GONE_WRONG: string =  "Something has gone wrong";
export const NO_EMAIL_ADDRESS_FOUND: string =  "No email address for company number";
export const EMAIL_ADDRESS_INVALID: string =  "Enter an email address in the correct format, like name@example.com";
export const NO_EMAIL_ADDRESS_SUPPLIED: string =  "Enter the registered email address";
export const TRANSACTION_CREATE_ERROR: string =  "Unable to create a transaction record for company ";
export const TRANSACTION_CLOSE_ERROR: string =  "Unable to close a transaction record for company ";
export const CONFIRM_EMAIL_CHANGE_ERROR: string =  "You need to accept the registered email address statement";
export const FAILED_TO_CREATE_REA_ERROR: string =  "Failed to create Registered Email Address Resource for company ";
export const FAILED_TO_FIND_RETURN_URL_ERROR: string = "Unable to find return page";
export const PRIVATE_API_ERROR: string =  "You cannot set both api key and oauth token to create a client. Please use one or the other";

// erroring constants
export const UPDATE_EMAIL_ERROR_KEY: string =  "changeEmailAddress";
export const UPDATE_EMAIL_ERROR_ANCHOR: string =  "#change-email-address";
