
import * as config from "../config/index";

// APP CONSTANTS
export const VALID_COMPANY_TYPES = ["private-unlimited", "ltd", "plc", "private-limited-guarant-nsc-limited-exemption", "private-limited-guarant-nsc", "private-unlimited-nsc", "private-limited-shares-section-30-exemption"];
export const VALID_COMPANY_STATUS = ["active", "liquidation", "receivership", "voluntary-agreement", "insolvency-proceedings", "administration"];
export const INVALID_COMPANY_TYPE_REASON = "invalidCompanyType";
export const INVALID_COMPANY_STATUS_REASON= "invalidCompanyStatus";

export const COMPANY_NAME_PLACEHOLDER = "COMPANY_NAME_PLACEHOLDER";

export const invalidCompanyTypePage = {
  pageHeader: "Only limited and unlimited companies can use this service",
  pageBody: `<p>You can only update a registered email address for ` + COMPANY_NAME_PLACEHOLDER + ` if it's a:</p>
    <ul>
        <li>private limited company</li>
        <li>public limited company</li>
        <li>private unlimited company</li>
    </ul>  

    <p>If this is the wrong company, <a href="` + config.COMPANY_NUMBER_URL + `" data-event-id="enter-a-different-company-number-link">go back and enter a different company number</a>.</p>
    <p><a href="https://www.gov.uk/contact-companies-house" data-event-id="contact-us-link">Contact us</a> if you have any questions.</p>
    `
};

export const invalidCompanyStatusPage = {
  pageHeader: "Company is dissolved or in the process of being dessolved",
  pageBody: `<p>` + COMPANY_NAME_PLACEHOLDER + ` cannot use this service because it has been dissolved, or it's in the process of being dissolved.</p>

  <p><a href="https://www.gov.uk/guidance/company-restoration-guide" data-event-id="read-the-company-restoration-guide-link">Read the Company Restoration Guide</a> to find out more about restoring a company name to the register.</p>
  <p>If this is the wrong company, <a href="`+ config.REA_HOME_PAGE +`" data-event-id="start-the-service-again-link">start the service again</a>.</p>
  <p><a href="https://www.gov.uk/contact-companies-house" data-event-id="contact-us-link">Contact us</a> if you have any questions.</p>
  `
};
