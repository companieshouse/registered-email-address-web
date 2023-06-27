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
    if(session.data.extra_data?.invalidCompanyReason === validationConfig.INVALID_COMPANY_TYPE_REASON){
      this.buildPage(validationConfig.invalidCompanyTypePage, session.data.extra_data.companyProfile.companyName )
    }
    if(session.data.extra_data?.invalidCompanyReason === validationConfig.INVALID_COMPANY_STATUS_REASON){
      this.buildPage(validationConfig.invalidCompanyStatusPage, session.data.extra_data.companyProfile.companyName)
    }
  this.viewData.userEmail = session.data.signin_info?.user_profile?.email;
  return Promise.resolve(this.viewData);
  }

  buildPage(pageInformation: any, companyName: string) {
    this.viewData.pageHeader = pageInformation.pageHeader;
    this.viewData.pageBody = pageInformation.pageBody.replace(new RegExp(validationConfig.COMPANY_NAME_PLACEHOLDER, "g"), companyName);
  };
}









