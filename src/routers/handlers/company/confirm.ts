import { Request, Response } from "express";
import { GenericHandler } from "./../generic";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { getCompanyProfile } from "../../../services/company/company.profile.service";
import { buildAddress, formatForDisplay } from "../../../services/company/confirm.company.service";
import logger from "../../../lib/Logger";
import * as constants from "../../../constants/app.const";

export class ConfirmCompanyHandler extends GenericHandler {

  constructor () {
    super();
    this.viewData.title = "Update a registered email address";
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

  post (req: Request, response: Response): Promise<Object> {
    logger.info(`POST request to serve company confirm page`);
    // TODO this is launch point for validation?
    return Promise.resolve(this.viewData);
  }
}

const buildPageOptions = (session: Session, companyProfile: CompanyProfile): Object => {
  companyProfile = formatForDisplay(companyProfile);
  const addressArray: string[] = [companyProfile.registeredOfficeAddress.poBox,
    companyProfile.registeredOfficeAddress.premises, companyProfile.registeredOfficeAddress.addressLineOne,
    companyProfile.registeredOfficeAddress.addressLineTwo, companyProfile.registeredOfficeAddress.locality,
    companyProfile.registeredOfficeAddress.region, companyProfile.registeredOfficeAddress.country,
    companyProfile.registeredOfficeAddress.postalCode];
  const address = buildAddress(addressArray);
  return {
    company: companyProfile,
    address: address
  };
};
