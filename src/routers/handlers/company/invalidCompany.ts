import { Request, Response } from "express";
import { GenericHandler } from "../generic";
import { Session } from "@companieshouse/node-session-handler";
import { logger } from "../../../utils/common/Logger";
import {
  COMPANY_NAME_PLACEHOLDER,
  invalidCompanyTypePage,
  invalidCompanyStatusPage,
  invalidCompanyNoEmailPage,
  INVALID_COMPANY_NO_EMAIL_REASON,
  INVALID_COMPANY_STATUS_REASON,
  INVALID_COMPANY_TYPE_REASON
} from "../../../constants/validation.const";

const PAGE_TITLE = "Invalid Company";

export class InvalidCompanyHandler extends GenericHandler {

  constructor () {
    super();
    this.viewData.signoutBanner = false;
    this.viewData.title = PAGE_TITLE;

  }
  async get (req: Request, res: Response): Promise<Object> {
    logger.info(`GET request to serve company Invalid Company`);
    const session: Session = req.session as Session;
    let invalidPageType: any;
    switch(session.data.extra_data?.invalidCompanyReason) {
        case INVALID_COMPANY_TYPE_REASON:
          invalidPageType = invalidCompanyTypePage;
          break;
        case INVALID_COMPANY_STATUS_REASON:
          invalidPageType = invalidCompanyStatusPage;
          break;
        case INVALID_COMPANY_NO_EMAIL_REASON:
          invalidPageType = invalidCompanyNoEmailPage;
          break;
    }
    this.buildPage(invalidPageType, session.data.extra_data.companyProfile.companyName);
    this.viewData.userEmail = session.data.signin_info?.user_profile?.email;
    return Promise.resolve(this.viewData);
  }

  buildPage(pageInformation: any, companyName: string) {
    this.viewData.pageHeader = pageInformation.pageHeader;
    this.viewData.pageBody = pageInformation.pageBody.replace(new RegExp(COMPANY_NAME_PLACEHOLDER, "g"), companyName);
  }
}
