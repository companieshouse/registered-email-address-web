import { Request, Response } from "express";
import { GenericHandler } from "../generic";
import { inject } from "inversify";
import logger from "../../../lib/Logger";

import * as config from "../../../config/index";
import Optional from "../../../models/optional";
import FormValidator from "../../../utils/formValidator.util";
import formSchema from "../../../schemas/companySearch.schema";
import ValidationErrors from "../../../models/view/validationErrors.model";
import CompanyNumberSanitizer from "../../../utils/companyNumberSanitizer";

import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../../../services/company/company.profile.service";

import * as constants from "../../../constants/app.const";

// class constants
const pageTitleConst: string = "Company Number";
const postRequestLogConst: string = "POST request to get company details page";

export class CompanySearchHandlerPost extends GenericHandler {
    constructor (
        @inject(FormValidator) private validator: FormValidator,
        @inject(CompanyNumberSanitizer) private companyNumberSanitizer: CompanyNumberSanitizer
    ) {
        super();
        this.viewData.title = pageTitleConst;
        this.viewData.backUri = config.REA_HOME_PAGE;
    }

    async post (req: Request, res: Response): Promise<Object> {
        logger.info(postRequestLogConst);
        var body = req.body;
        body.companyNumber = this.companyNumberSanitizer.sanitizeCompany(body.companyNumber!);
        const errors: Optional<ValidationErrors> = this.validator.validate(body, formSchema);
        if (errors) {
            this.viewData.errors = errors;
            return this.viewData;
        }
        try {
            const companyProfile: CompanyProfile = await getCompanyProfile(body.companyNumber);
            return companyProfile;
        } catch (e) {
            this.viewData.errors = {
                companyNumber: constants.INVALID_COMPANY_NUMBER
            };
            return this.viewData;
        }
    }
};
