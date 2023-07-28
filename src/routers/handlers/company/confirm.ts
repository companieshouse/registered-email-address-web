import {Request, Response} from "express";
import { GenericHandler } from "./../generic";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile";
import { Session } from "@companieshouse/node-session-handler";
import { Resource } from "@companieshouse/api-sdk-node";
import { getCompanyProfile } from "../../../services/company/company.profile.service";
import { buildAddress, formatForDisplay } from "../../../services/company/confirm.company.service";
import { getCompanyEmail } from "../../../services/company/company.email.service";
import {RegisteredEmailAddress} from "@companieshouse/api-sdk-node/dist/services/registered-email-address/types";

import {logger} from "../../../utils/common/Logger";

import {
  COMPANY_PROFILE,
  COMPANY_NUMBER,
  INVALID_COMPANY_NUMBER,
  REGISTERED_EMAIL_ADDRESS,
  THERE_IS_A_PROBLEM_ERROR
} from "../../../constants/app.const";
import {
  INVALID_COMPANY_NO_EMAIL_REASON,
  INVALID_COMPANY_SERVICE_UNAVAILABLE,
  INVALID_COMPANY_STATUS_REASON,
  INVALID_COMPANY_TYPE_REASON,
  VALID_COMPANY_STATUS,
  VALID_COMPANY_TYPES
} from "../../../constants/validation.const";
import { COMPANY_NUMBER_URL } from "../../../config";
import { StatusCodes } from "http-status-codes";

const PAGE_TITLE = "Confirm this is the correct company";

export class ConfirmCompanyHandler extends GenericHandler {

  constructor() {
    super();
    this.viewData.title = PAGE_TITLE;
  }

  async get(req: Request, response: Response): Promise<Object> {
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
        session?.setExtraData(COMPANY_NUMBER, companyProfile.companyNumber);
        session?.setExtraData(COMPANY_PROFILE, companyProfile);
        this.buildPageOptions(session, companyProfile);
      } catch (e) {
        const error = e as Error;
        if (error?.name === THERE_IS_A_PROBLEM_ERROR) {
          logger.info(`company confirm - oracle query service unavailable`);
          this.viewData.errors = {
            companyNumber: THERE_IS_A_PROBLEM_ERROR
          };
        } else {
          logger.info(`company confirm - company profile not found`);
          this.viewData.errors = {
            companyNumber: INVALID_COMPANY_NUMBER
          };
        }
      }
    }
    return Promise.resolve(this.viewData);
  }

  async post(req: Request, response: Response): Promise<any> {
    logger.info(`POST request to serve company confirm page`);

    const session: Session = req.session as Session;
    const companyProfile: CompanyProfile = session.data.extra_data.companyProfile;
    if (!VALID_COMPANY_TYPES.includes(companyProfile.type)) {
      logger.info(`company confirm - invalid company type`);
      this.viewData.invalidCompanyReason = INVALID_COMPANY_TYPE_REASON;
    } else if (!VALID_COMPANY_STATUS.includes(companyProfile.companyStatus)) {
      logger.info(`company confirm - invalid company status`);
      this.viewData.invalidCompanyReason = INVALID_COMPANY_STATUS_REASON;
    } else {
      try {
        logger.info(`company confirm - checking company email`);
        const companyEmail = await getCompanyEmail(companyProfile.companyNumber);
        logger.info(`company confirm - company email found: ${companyEmail}`);
        session?.setExtraData(REGISTERED_EMAIL_ADDRESS, companyEmail.resource?.registeredEmailAddress);
      } catch (e) {
        const sdkResponse = e as Resource<RegisteredEmailAddress>;
        if (sdkResponse.httpStatusCode === StatusCodes.NOT_FOUND) {
          logger.error(`company confirm - email address not found`);
          this.viewData.invalidCompanyReason = INVALID_COMPANY_NO_EMAIL_REASON;
        } else {
          logger.error(`company confirm - oracle query service failure`);
          this.viewData.invalidCompanyReason = INVALID_COMPANY_SERVICE_UNAVAILABLE;
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
    this.viewData.backUri = COMPANY_NUMBER_URL;
  }
}
