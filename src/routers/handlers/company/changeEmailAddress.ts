import { Request, Response } from "express";
import { GenericHandler } from "./../generic";
import logger from "../../../lib/Logger";
import { validateEmailString } from "../../../utils/validateEmailString";
import { getCompanyEmail } from "../../../services/company/company.email.service";
import * as constants from "../../../constants/app.const";

export class ChangeEmailAddressHandler extends GenericHandler {

    constructor () {
        super();
        this.viewData.title = "Update a registered email address";
    }

    async get (req: Request, response: Response): Promise<Object> {
        logger.info(`GET request to serve change registered email address page`);
        var companyNumber: string | undefined;
        // first try session for companyNumber, else query param
        if (req.session?.getExtraData("companyNumber") !== undefined) {
            companyNumber = req.session?.getExtraData("companyNumber");
        } else {
            companyNumber = req.query.companyNumber?.toString() ?? undefined;
        }
        // companyNumber should never be undefined!
        if (companyNumber !== undefined) {
            var companyEmail = await getCompanyEmail(companyNumber);
            this.viewData.companyEmailAddress = companyEmail.resource?.companyEmail;
            return this.viewData;
        } else{
            this.viewData.errors = {
                companyNumber: constants.NO_EMAIL_ADDRESS_FOUND
            };
            return Promise.resolve(this.viewData);
        }
    }

    async post (req: Request, response: Response): Promise<Object> {
        logger.info(`POST request to serve change registered email address page`);
        // validate email address provided
        // if (!validateEmailString(req.))
        return Promise.resolve(this.viewData);
    }
};
