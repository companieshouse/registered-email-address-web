import * as joi from "joi";

const emptyCompanyEmailAddressError: string = "Enter the registered email address";
const change_email_address_schema = joi.object({
  changeEmailAddress: joi.string()
    .required()
    .messages({
      "string.empty": emptyCompanyEmailAddressError
    })
});

export default change_email_address_schema;
