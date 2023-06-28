import * as Joi from "joi";

const emptyCompanEmailAddressError: string = "Enter the registered email address";
const formSchema = Joi.object({
  changeEmailAddress: Joi.string()
    .required()
    .messages({
      "string.empty": emptyCompanEmailAddressError
    })
});

export default formSchema;
