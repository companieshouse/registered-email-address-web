import { Request, Response } from "express";
import { GenericHandler } from "../generic";
import { inject } from "inversify";
import { Session } from "@companieshouse/node-session-handler";
import { logger } from "../../../lib/Logger";
import { validateEmailString } from "../../../utils/validateEmailString";

import { 
  COMPANY_EMAIL,
  COMPANY_NUMBER,
  NO_EMAIL_ADDRESS_FOUND,
  EMAIL_ADDRESS_INVALID
} from "../../../constants/app.const";

import { COMPANY_BASE_URL, CONFIRM_URL } from "../../../config/index";

import ValidationErrors from "../../../models/view/validationErrors.model";

import Optional from "../../../models/optional";
import FormValidator from "../../../utils/formValidator.util";
import formSchema from "../../../schemas/changeEmailAddress.schema";

export class ChangeEmailAddressHandler extends GenericHandler {

  constructor (@inject(FormValidator) private validator: FormValidator, userEmail: string | undefined) {
    super();
    this.viewData.title = "Update a registered email address";
    this.viewData.backUri = COMPANY_BASE_URL+CONFIRM_URL;
    if (userEmail !== undefined) {
      this.viewData.userEmail = userEmail;
    }
  }

  async get (req: Request, response: Response): Promise<Object> {
    logger.info(`GET request to serve change registered email address page`);

    const companyEmailAddress: string | undefined = req.session?.getExtraData(COMPANY_EMAIL);

    if (companyEmailAddress !== undefined) {
      this.viewData.companyEmailAddress = companyEmailAddress;
      return Promise.resolve(this.viewData); 
    } else {
      logger.info(`company confirm - company email not found`);
      this.viewData.errors = NO_EMAIL_ADDRESS_FOUND;
    }
    return Promise.resolve(this.viewData);
  }

  async post (req: Request, response: Response): Promise<Object> {
    logger.info(`POST request to serve change registered email address page`);

    const companyEmailAddressGiven: string = req.body.changeEmailAddress;

    const errors: Optional<ValidationErrors> = this.validator.validate(req.body, formSchema);

    //check: no email supplied
    if (errors) {
      this.viewData.errors = errors;
      return this.viewData;
    }

    //check: email format invalid
    if (!validateEmailString(companyEmailAddressGiven)) {
      this.viewData.errors = {
        changeEmailAddress: EMAIL_ADDRESS_INVALID
      };
      return Promise.resolve(this.viewData);
    }
    return Promise.resolve(this.viewData);
  }
}
