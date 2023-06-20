import { Request, Response } from "express";
import { GenericHandler } from "./../generic";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { getCompanyProfile } from "../../../services/company/company.profile.service";
import { buildAddress, formatForDisplay } from "../../../services/company/confirm.company.service";
import logger from "../../../lib/Logger";

export class ConfirmCompanyHandler extends GenericHandler {

    constructor () {
        super();
        this.viewData.title = "Update a registered email address";
    }

    async get (req: Request, response: Response): Promise<Object> {
        logger.info(`GET request to serve company confirm page`);
        const session: Session = req.session as Session;
        // const companyNumber = req.query.companyNumber as string;
        const companyNumber = session.data.extra_data.companyDetails.companyNumber as string;
        const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
        this.viewData = await buildPageOptions(session, companyProfile);
        return Promise.resolve(this.viewData);
    }

    post (req: Request, response: Response): Promise<Object> {
        logger.info(`POST request to serve company confirm page`);
        // TODO this is launch point for validation?
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
