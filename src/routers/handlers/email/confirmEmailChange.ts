import { Request, Response } from "express";
import { GenericHandler } from "../generic";
import { logger } from "../../../lib/Logger";
import { REGISTERED_EMAIL_ADDRESS, NO_EMAIL_ADDRESS_FOUND } from "../../../constants/app.const";
import { EMAIL_CHANGE_EMAIL_ADDRESS_URL } from "../../../config/index";

export class ConfirmChangeEmailAddressHandler extends GenericHandler {

  constructor (userEmail: string | undefined) {
    super();
    this.viewData.title = "Update a registered email address";
    this.viewData.backUri = EMAIL_CHANGE_EMAIL_ADDRESS_URL;
    if (userEmail !== undefined) {
      this.viewData.userEmail = userEmail;
    }
  }
  
  async get (req: Request, response: Response): Promise<Object> {
    logger.info(`GET request to serve confirm change registered email address page`);

    if (req.session?.getExtraData(REGISTERED_EMAIL_ADDRESS) !== undefined) {
      this.viewData.companyEmailAddress = req.session?.getExtraData(REGISTERED_EMAIL_ADDRESS);
      // reset email in session - don't want this in reality
      req.session?.setExtraData(REGISTERED_EMAIL_ADDRESS, undefined);
      return Promise.resolve(this.viewData);
    } else{
      this.viewData.errors = {
        companyNumber: NO_EMAIL_ADDRESS_FOUND
      };
      return Promise.resolve(this.viewData);
    }
  }
}
