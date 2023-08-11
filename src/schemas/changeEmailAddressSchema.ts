import * as Joi from "joi";

const emptyCompanyEmailAddressError: string = "Enter the registered email address";
const changeEmailAddressSchema = Joi.object({
  changeEmailAddress: Joi.string()
    .required()
    .messages({
      "string.empty": emptyCompanyEmailAddressError
    })
});

export default changeEmailAddressSchema;
