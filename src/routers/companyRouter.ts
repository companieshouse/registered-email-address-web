import { Request, Response, Router, NextFunction } from "express";
import { ConfirmCompanyHandler } from "./handlers/company/confirm";
import { InvalidCompanyHandler } from "./handlers/company/invalidCompany";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { logger } from "../utils/common/Logger";
import {
  COMPANY_INVALID_PAGE,
  CONFIRM_URL,
  EMAIL_CHANGE_EMAIL_ADDRESS_URL,
  INVALID_COMPANY_URL,
  INVALID_URL,
  NUMBER_URL,
  THERE_IS_A_PROBLEM_URL,
  COMPANY_LOOKUP_URL
} from "../config";
import { COMPANY_PROFILE, COMPANY_NUMBER, INVALID_COMPANY_REASON } from "../constants/app.const";
import { INVALID_COMPANY_SERVICE_UNAVAILABLE } from "../constants/validation.const";

const companyRouter: Router = Router();
const routeViews: string = "router_views/company/";
const invalidCompanyReason: string = "invalidCompanyReason";

// GET: /registered-email-address/company/number
companyRouter.get(NUMBER_URL, (req: Request, res: Response, next: NextFunction) => {
  logger.info(`GET request to enter company number`);
  res.redirect(COMPANY_LOOKUP_URL);
});

// GET: /registered-email-address/company/confirm
companyRouter.get(CONFIRM_URL, async (req: Request, res: Response, next: NextFunction) => {
  new ConfirmCompanyHandler().get(req, res).then((viewData) => {
    // eslint-disable-next-line no-prototype-builtins
    res.render(`${routeViews}` + CONFIRM_URL, viewData);
  });
});

// POST: /registered-email-address/company/confirm
companyRouter.post(CONFIRM_URL, async (req: Request, res: Response, next: NextFunction) => {
  const companyProfile: CompanyProfile | undefined = req.session?.getExtraData(COMPANY_PROFILE);
  if (companyProfile !== undefined) {
    req.session?.setExtraData(COMPANY_NUMBER, companyProfile.companyNumber);
  }
  await new ConfirmCompanyHandler().post(req, res).then((data) => {
    if (Object.prototype.hasOwnProperty.call(data, invalidCompanyReason)) {
      if (data.invalidCompanyReason === INVALID_COMPANY_SERVICE_UNAVAILABLE) {
        res.redirect(THERE_IS_A_PROBLEM_URL);
      } else {
        req.session?.setExtraData(INVALID_COMPANY_REASON, data.invalidCompanyReason);
        res.redirect(INVALID_COMPANY_URL);
      }
    } else {
      res.redirect(EMAIL_CHANGE_EMAIL_ADDRESS_URL);
    }
  });
});

// GET: /registered-email-address/company/invalid
companyRouter.get(INVALID_URL, async (req: Request, res: Response, next: NextFunction) => {
  await new InvalidCompanyHandler().get(req, res).then((data) => {
    res.render(`${routeViews}` + COMPANY_INVALID_PAGE, data);
  });
});

export default companyRouter;
