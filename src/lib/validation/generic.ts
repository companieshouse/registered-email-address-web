// Only include methods that validate common entities and fields i.e. fields that are common to multiple forms across the service
// These methods are then called by individual form validators that extend this class
// Examples of fields common to multiple forms (to include in this class) are: email, username, phone number, postcode, gender, etc...

import logger from "./../Logger";
import errorManifest from "./../utils/error_manifests/default";

export class GenericValidator {

    errors: any;
    payload: any;
    errorManifest: any;

    constructor () {
        this.errors = this.getErrorSignature();
        this.errorManifest = errorManifest;
    }

    protected getErrorSignature () {
        return {
            status: 400,
            name: "VALIDATION_ERRORS",
            message: errorManifest.validation.default.summary,
            stack: {}
        };
    }

    isValidEmail (email: string): boolean {
        logger.info(`Request to validate email: ${email}`);
        const regex = /^.+@.+\..+$/;
        if (regex.test(email)) {
            return true;
        }
        return false;
    }

    isValidCompanyName (companyName: string): boolean {
        logger.info(`Request to validate company name: ${companyName}`);
        // eslint-disable-next-line
        const regex = /^[a-z\d\_-][a-z\d\_\-\.\s\&]{1,71}$/ig;
        if (regex.test(companyName)) {
            return true;
        }
        return false;
    }
};
