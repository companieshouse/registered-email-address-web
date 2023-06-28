import { Request, Response } from "express";
import { GenericHandler } from "./../generic";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { getCompanyProfile } from "../../../services/company/company.profile.service";
import { buildAddress, formatForDisplay } from "../../../services/company/confirm.company.service";
import logger from "../../../lib/Logger";
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
      this.viewData = buildPageOptions(session, companyProfile);
    } else {
      try {
        const companyNumber: string = req.query.companyNumber?.toString() ?? "";
        companyProfile = await getCompanyProfile(companyNumber);
        // eslint-disable-next-line no-unused-expressions
        session?.setExtraData(constants.COMPANY_PROFILE, companyProfile);
        this.viewData = buildPageOptions(session, companyProfile);
      } catch (e) {
        this.viewData.errors = {
          companyNumber: constants.INVALID_COMPANY_NUMBER
        };
      }
    }
    return Promise.resolve(this.viewData);
  }

  async post (req: Request, response: Response): Promise<any> {
    logger.info(`POST request to serve company confirm page`);
    const session: Session = req.session as Session;
    const companyProfile: CompanyProfile = session.data.extra_data.companyProfile;
    if (!validationConstants.VALID_COMPANY_TYPES.includes(companyProfile.type)) {
      this.viewData.invalidCompanyReason = "invalidCompanyType";
    } else if (!validationConstants.VALID_COMPANY_STATUS.includes(companyProfile.companyStatus)) {
      this.viewData.invalidCompanyReason = "invalidCompanyStatus";
    }

    return Promise.resolve(this.viewData);
  }
}

const buildPageOptions = async (session: Session, companyProfile: CompanyProfile): Promise<Object> => {
  const formattedCompanyProfile = formatForDisplay(companyProfile);
  const address = buildAddress(formattedCompanyProfile);
  return {
    companyProfile :  companyProfile,
    company: formattedCompanyProfile,
    address: address,
    userEmail : session.data.signin_info?.user_profile?.email,
    backUri: config.COMPANY_NUMBER_URL
  };
};
