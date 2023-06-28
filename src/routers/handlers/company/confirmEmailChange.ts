import { Request, Response } from "express";
import { GenericHandler } from "./../generic";
import logger from "../../../lib/Logger";
import { validateEmailString } from "../../../utils/validateEmailString";
import { getCompanyEmail } from "../../../services/company/company.email.service";
import { COMPANY_EMAIL, NO_EMAIL_ADDRESS_FOUND } from "../../../constants/app.const";
import { COMPANY_CHANGE_EMAIL_ADDRESS_URL } from "../../../config/index";

export class ConfirmChangeEmailAddressHandler extends GenericHandler {

  constructor () {
    super();
    this.viewData.title = "Update a registered email address";
    this.viewData.backUri = COMPANY_CHANGE_EMAIL_ADDRESS_URL;
  }
  
  async get (req: Request, response: Response): Promise<Object> {
    logger.info(`GET request to serve confirm change registered email address page`);
    let companyNumber: string | undefined;
    // first try session for companyNumber, else query param
    if (req.session?.getExtraData(COMPANY_EMAIL) !== undefined) {
      this.viewData.companyEmailAddress = req.session?.getExtraData(COMPANY_EMAIL);
      // reset email in session - don't want this in reality
      req.session?.setExtraData(COMPANY_EMAIL, undefined);
      return Promise.resolve(this.viewData);
    } else{
      this.viewData.errors = {
        companyNumber: NO_EMAIL_ADDRESS_FOUND
      };
      return Promise.resolve(this.viewData);
    }
  }
}
