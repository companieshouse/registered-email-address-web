import { Request, Response } from "express";
import { GenericHandler } from "./../generic";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile";
import { Session } from "@companieshouse/node-session-handler";
import { getCompanyProfile } from "../../../services/company/company.profile.service";
import { buildAddress, formatForDisplay } from "../../../services/company/confirm.company.service";
import { getCompanyEmail } from "../../../services/company/company.email.service";
import { logger, createAndLogServiceUnavailable } from "../../../lib/Logger";
import * as constants from "../../../constants/app.const";
import * as validationConstants from "../../../constants/validation.const";
import * as config from "../../../config/index";


export class ConfirmCompanyHandler extends GenericHandler {

  constructor () {
    super();
  }

  async get (req: Request, response: Response): Promise<Object> {
    logger.info(`GET request to serve company confirm page`);
    const session: Session = req.session as Session;
    let companyProfile: CompanyProfile;
    if (req.query.companyNumber === undefined) {
      companyProfile = session.data.extra_data.companyProfile;
      this.buildPageOptions(session, companyProfile);
    } else {
      try {
        const companyNumber: string = req.query.companyNumber?.toString() ?? "";
        companyProfile = await getCompanyProfile(companyNumber);
        // eslint-disable-next-line no-unused-expressions
        session?.setExtraData(constants.COMPANY_PROFILE, companyProfile);
        this.buildPageOptions(session, companyProfile);
      } catch (e) {
        if (e instanceof createAndLogServiceUnavailable) {
          logger.info(`company confirm - oracle query service unavailable`);
          this.viewData.errors = {
            companyNumber: constants.SERVICE_UNAVAILABLE
          };
        } else {
          logger.info(`company confirm - company profile not found`);
          this.viewData.errors = {
            companyNumber: constants.INVALID_COMPANY_NUMBER
          };
        }
      }
    }
    return Promise.resolve(this.viewData);
  }

  async post (req: Request, response: Response): Promise<any> {
    logger.info(`POST request to serve company confirm page`);
    const session: Session = req.session as Session;
    const companyProfile: CompanyProfile = session.data.extra_data.companyProfile;
    if (!validationConstants.VALID_COMPANY_TYPES.includes(companyProfile.type)) {
      logger.info(`company confirm - invalid company type`);
      this.viewData.invalidCompanyReason = validationConstants.INVALID_COMPANY_TYPE_REASON;
    } else if (!validationConstants.VALID_COMPANY_STATUS.includes(companyProfile.companyStatus)) {
      logger.info(`company confirm - invalid company status`);
      this.viewData.invalidCompanyReason = validationConstants.INVALID_COMPANY_STATUS_REASON;
    } else {
      try {
        logger.info(`company confirm - checking company email`);
        const companyEmail = await getCompanyEmail(companyProfile.companyNumber);
        logger.info(`company confirm - company email found: ${companyEmail}`);
        session?.setExtraData(constants.REGISTERED_EMAIL_ADDRESS, companyEmail);
      } catch (e: any) {
        if (e instanceof createAndLogServiceUnavailable) {
          logger.info(`company confirm - oracle query service unavailable`);
          this.viewData.invalidCompanyReason = validationConstants.INVALID_COMPANY_SERVICE_UNAVAILABLE;
        } else {
          logger.info(`company confirm - company email not found`);
          this.viewData.invalidCompanyReason = validationConstants.INVALID_COMPANY_NO_EMAIL_REASON;
        }
      }      
    }
    return Promise.resolve(this.viewData);
  }

  buildPageOptions (session: Session, companyProfile: CompanyProfile){
    const formattedCompanyProfile = formatForDisplay(companyProfile);
    const address = buildAddress(formattedCompanyProfile);
    this.viewData.companyProfile = companyProfile;
    this.viewData.company = formattedCompanyProfile;
    this.viewData.address = address;
    this.viewData.userEmail = session.data.signin_info?.user_profile?.email;
    this.viewData.backUri = config.COMPANY_NUMBER_URL;
  }
}
