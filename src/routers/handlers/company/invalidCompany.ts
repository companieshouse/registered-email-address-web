import { Request, Response } from "express";
import { GenericHandler } from "./../generic";
import { Session } from "@companieshouse/node-session-handler";
import logger from "../../../lib/Logger";
import {limitedUnlimited, COMPANY_NAME_PLACEHOLDER} from "../../../constants/validation.const"




export class InvalidCompanyHandler extends GenericHandler {

    constructor () {
        super();
        this.viewData
    }

    async get (req: Request, res: Response): Promise<Object> {
        logger.info(`GET request to serve company Invalid Company`);
        const session: Session = req.session as Session;

        this.viewData.pageHeader = limitedUnlimited.pageHeader;
        this.viewData.pageBody = limitedUnlimited.pageBody.replace(new RegExp(COMPANY_NAME_PLACEHOLDER, 'g'), 
        session.data.extra_data.companyProfile.companyName)

        return Promise.resolve(this.viewData);
    }

};