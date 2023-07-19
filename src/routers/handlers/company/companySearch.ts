import { Request, Response } from "express";
import { GenericHandler } from "../generic";
import { inject } from "inversify";
import { logger } from "../../../utils/common/Logger";
import { REA_HOME_PAGE } from "../../../config/index";
import Optional from "../../../models/optional";
import FormValidator from "../../../utils/common/formValidator.util";
import formSchema from "../../../schemas/companySearch.schema";
import ValidationErrors from "../../../models/validationErrors.model";
import CompanyNumberSanitizer from "../../../utils/company/companyNumberSanitizer";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../../../services/company/company.profile.service";
import { INVALID_COMPANY_NUMBER, SERVICE_UNAVAILABLE } from "../../../constants/app.const";

// class constants
const pageTitleConst: string = "Company Number";
const postRequestLogConst: string = "POST request to get company details page";

export class CompanySearchHandler extends GenericHandler {
  constructor (
        @inject(FormValidator) private validator: FormValidator,
        @inject(CompanyNumberSanitizer) private companyNumberSanitizer: CompanyNumberSanitizer
  ) {
    super();
    this.viewData.backUri = REA_HOME_PAGE;
  }

  async post (req: Request, res: Response): Promise<Object> {
    logger.info(postRequestLogConst);
    const body = req.body;
    const companyNumber = this.companyNumberSanitizer.sanitizeCompany(body.companyNumber);
    const errors: Optional<ValidationErrors> = this.validator.validate(body, formSchema);
    if (errors) {
      this.viewData.errors = errors;
      return this.viewData;
    }
    try {
      const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
      return companyProfile;
    } catch (e: any) {
      const error = e as Error;
      if (error?.name === SERVICE_UNAVAILABLE) {
        logger.info(`company confirm - oracle query service unavailable`);
        this.viewData.errors = {
          companyNumber: SERVICE_UNAVAILABLE
        };
      } else {
        logger.info(`company confirm - company profile not found`);
        this.viewData.errors = {
          companyNumber: INVALID_COMPANY_NUMBER
        };
      }
      return this.viewData;
    }
  }
}
