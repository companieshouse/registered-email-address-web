import { Request, Response } from "express";
import { GenericHandler } from "./../generic";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { getCompanyProfile } from "../../../services/company/company.profile.service";
import { buildAddress, formatForDisplay } from "../../../services/company/confirm.company.service";
import logger from "../../../lib/Logger";
import * as config from "../../../config/index";
import { valid } from "joi";



export class InvalidCompanyHandler extends GenericHandler {

    constructor () {
        super();
        this.viewData.title = "Invalid Company";
    }

    async get (req: Request, res: Response): Promise<Object> {
        logger.info(`GET request to serve company Invalid Company`);
        const session: Session = req.session as Session;
        return Promise.resolve(this.viewData);
    }

};