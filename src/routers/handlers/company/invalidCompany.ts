import { Request, Response } from "express";
import { GenericHandler } from "./../generic";
import { Session } from "@companieshouse/node-session-handler";
import logger from "../../../lib/Logger";
import * as validationConfig from "../../../constants/validation.const";


export class InvalidCompanyHandler extends GenericHandler {

  constructor () {
    super();
  }
  async get (req: Request, res: Response): Promise<Object> {
    logger.info(`GET request to serve company Invalid Company`);
    const session: Session = req.session as Session;
    let invalidPageType: any;
    switch(session.data.extra_data?.invalidCompanyReason) {
        case validationConfig.INVALID_COMPANY_TYPE_REASON:
          invalidPageType = validationConfig.invalidCompanyTypePage;
          break;
        case validationConfig.INVALID_COMPANY_STATUS_REASON:
          invalidPageType = validationConfig.invalidCompanyStatusPage;
          break;
        case validationConfig.INVALID_COMPANY_NO_EMAIL_REASON:
          invalidPageType = validationConfig.invalidCompanyNoEmailPage;
          break;
    }
    this.buildPage(invalidPageType, session.data.extra_data.companyProfile.companyName);
    this.viewData.userEmail = session.data.signin_info?.user_profile?.email;
    return Promise.resolve(this.viewData);
  }

  buildPage(pageInformation: any, companyName: string) {
    this.viewData.pageHeader = pageInformation.pageHeader;
    this.viewData.pageBody = pageInformation.pageBody.replace(new RegExp(validationConfig.COMPANY_NAME_PLACEHOLDER, "g"), companyName);
  }
}
