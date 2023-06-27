
import * as config from "../config/index";

export const COMPANY_NAME_PLACEHOLDER = "COMPANY_NAME_PLACEHOLDER";

export const limitedUnlimited = {
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
