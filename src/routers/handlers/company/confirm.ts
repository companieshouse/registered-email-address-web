import { Request, Response } from "express";
import { GenericHandler } from "./../generic";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { getCompanyProfile } from "../../../services/company/company.profile.service";
import { buildAddress, formatForDisplay } from "../../../services/company/confirm.company.service";
import logger from "../../../lib/Logger";
import * as constants from "../../../constants/app.const";
import * as config from "../../../config/index";

export class ConfirmCompanyHandler extends GenericHandler {

    constructor () {
        super();
        this.viewData.title = "Update a registered email address";
    }

    async get (req: Request, response: Response): Promise<Object> {
        logger.info(`GET request to serve company confirm page`);
        const session: Session = req.session as Session;
        var companyProfile: CompanyProfile;
        if (req.query.companyNumber === undefined) {
            companyProfile = session.data.extra_data.companyProfile;
            this.viewData = await buildPageOptions(session, companyProfile);
        } else {
            try {
                const companyNumber: string = req.query.companyNumber?.toString() ?? "";
                companyProfile = await getCompanyProfile(companyNumber);
                // eslint-disable-next-line no-unused-expressions
                session?.setExtraData(constants.COMPANY_PROFILE, companyProfile);
                this.viewData = await buildPageOptions(session, companyProfile);
            } catch (e) {
                this.viewData.errors = {
                    companyNumber: constants.INVALID_COMPANY_NUMBER
                };
            }
        }
        return Promise.resolve(this.viewData);
    }

    async post (req: Request, response: Response): Promise<Object> {
        logger.info(`POST request to serve company confirm page`);
        const session: Session = req.session as Session;
        const validCompanyType = config.VALID_COMPANY_TYPES;
        const companyType = session.data.extra_data.companyProfile.type;
        if (!validCompanyType.includes(companyType)) {
            this.viewData.invalidCompany = "invalidCompanyType";
        }
        return Promise.resolve(this.viewData);
    }
};

const buildPageOptions = async (session: Session, companyProfile: CompanyProfile): Promise<Object> => {
    companyProfile = formatForDisplay(companyProfile);
    var addressArray: string[] = [companyProfile.registeredOfficeAddress.poBox,
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
