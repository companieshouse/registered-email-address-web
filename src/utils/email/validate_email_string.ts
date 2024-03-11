import {HOSTNAME_REGEX, VALID_EMAIL_REGEX_PATTERN} from "../../constants/validation_const";

// validateEmailString simple function that validates email string
export function validateEmailString (emailString: string): boolean {

  if (!emailString) {
    return false;
  }

  const regexResult: RegExpMatchArray | null = emailString.match(VALID_EMAIL_REGEX_PATTERN);
  if (!regexResult) {
    return false;
  }

  if (emailString.includes("..")) {
    return false;
  }

  const hostName = regexResult[1];
  const parts = hostName.split(".");
  if (parts.length < 2) {
    return false;
  }
  for(const part of parts) {
    if (!part.toLowerCase().match(HOSTNAME_REGEX)) {
      return false;
    }
  }
  if (!parts[parts.length - 1].toLowerCase().match(HOSTNAME_REGEX)) {
    return false;
  }

  return true;
}
