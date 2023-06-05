import * as Joi from "joi";

const emptyCompanyNumberError: string = "You must enter a Company Number";
const invalidCompanyNumberError: string = "You must enter a valid company number";
const formSchema = Joi.object({
    companyNumber: Joi.string()
        .required()
        .max(8)
        .messages({
            "string.empty": emptyCompanyNumberError,
            "string.max": invalidCompanyNumberError,
            "any.required": emptyCompanyNumberError
        })
});

export default formSchema;
