/**
 * Format validation errors
 * @param errorKey The error key required for template
 * @param elementName The element to which error link anchors
 * @param errorMessage The message to be displayed to the user
 * @returns A validation errors object to display on the page
 */
export function formatValidationError(errorKey: string, elementName: string, errorMessage: string): {
    [key: string]: string;
  } & {
    errorList: {
      href: string,
      text: string,
    }[],
} {
  const errors = { errorList: [] } as any;
  errors.errorList.push({ href: elementName, text: errorMessage });
  errors[errorKey] = errorMessage;
  return errors;
}
