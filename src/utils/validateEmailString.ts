import {VALID_EMAIL_REGEX_PATTERN} from "../config/index";

// validateEmailString simple function that validates email string
export function validateEmailString (emailString: string): boolean {
    // assume its false til we determine otherwise
    var emailOK: boolean = false;
    if (emailString.match(VALID_EMAIL_REGEX_PATTERN)) {
        emailOK = true;
    }
    return emailOK;
}