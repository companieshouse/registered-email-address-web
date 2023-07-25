import { Request, Response } from "express";
import { GenericHandler } from "../generic";
import { logger } from "../../../utils/common/Logger";
import { REA_HOME_PAGE } from "../../../config/index";
import Optional from "../../../models/optional";
import FormValidator from "../../../utils/common/formValidator.util";
import formSchema from "../../../schemas/companySearch.schema";
import ValidationErrors from "../../../models/validationErrors.model";
import CompanyNumberSanitizer from "../../../utils/company/companyNumberSanitizer";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../../../services/company/company.profile.service";
import {
  INVALID_COMPANY_NUMBER,
  THERE_IS_A_PROBLEM_ERROR, 
  INVALID_COMPANY_NUMBER_ERROR_ANCHOR,
  INVALID_COMPANY_NUMBER_ERROR_KEY,
  COMPANY_NUMBER_NOT_FOUND,
} from "../../../constants/app.const";
import {formatValidationError} from "../../../utils/error/formatValidationErrors";
import { StatusCodes } from "http-status-codes";


// class constants
const postRequestLogConst: string = "POST request to get company details page";
const PAGE_TITLE = "What is the company number?";

export class CompanySearchHandler extends GenericHandler {
  constructor() {
    super();
    this.viewData.backUri = REA_HOME_PAGE;
    this.viewData.title = PAGE_TITLE;
  }

  get (req: Request, response: Response): Promise<Object> {
    this.viewData.userEmail = req.session?.data.signin_info?.user_profile?.email;
    return Promise.resolve(this.viewData);
  }

  async post (req: Request, res: Response): Promise<Object> {
    const formValidator = new FormValidator();
    const companyNumberSanitizer = new CompanyNumberSanitizer();
    logger.info(postRequestLogConst);
    const body = req.body;
    const companyNumber = companyNumberSanitizer.sanitizeCompany(body.companyNumber);
    const errors: Optional<ValidationErrors> = formValidator.validate(body, formSchema);
    if (errors) {
      this.viewData.errors = formatValidationError(
        INVALID_COMPANY_NUMBER_ERROR_KEY,
        INVALID_COMPANY_NUMBER_ERROR_ANCHOR,
        INVALID_COMPANY_NUMBER
      );
      this.viewData.title = "Error: " + PAGE_TITLE;
      return Promise.reject(this.viewData);
    }
    try {
      const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
      return Promise.resolve(companyProfile);
    } catch (e: any) {
      const error = e as Error;
      if (error?.message.includes(StatusCodes.NOT_FOUND.toLocaleString())) {
        logger.info(`company confirm - company profile not found`);
        this.viewData.errors = formatValidationError(
          INVALID_COMPANY_NUMBER_ERROR_KEY,
          INVALID_COMPANY_NUMBER_ERROR_ANCHOR,
          COMPANY_NUMBER_NOT_FOUND
        );
      } else {
        logger.info(`company confirm - oracle query service problem`);
        this.viewData.errors = formatValidationError(
          INVALID_COMPANY_NUMBER_ERROR_KEY,
          INVALID_COMPANY_NUMBER_ERROR_ANCHOR,
          THERE_IS_A_PROBLEM_ERROR
        );
      }
      this.viewData.title = "Error: " + PAGE_TITLE;
      return Promise.reject(this.viewData);
    }
  }
}
