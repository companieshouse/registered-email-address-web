import {VALID_EMAIL_REGEX_PATTERN} from "../../config/index";

// validateEmailString simple function that validates email string
export function validateEmailString (emailString: string): boolean {
  const regexResult: RegExpMatchArray | null = emailString.match(VALID_EMAIL_REGEX_PATTERN);
  if (regexResult !== null) {
    return true;
  }
  return false;
}
