import { Request, Response, Router, NextFunction } from "express";
import { CompanySearchHandler } from "./handlers/company/companySearch";
import { ConfirmCompanyHandler } from "./handlers/company/confirm";
import { InvalidCompanyHandler } from "./handlers/company/invalidCompany";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import * as config from "../config/index";
import { logger } from "../utils/common/Logger";
import FormValidator from "../utils/common/formValidator.util";
import CompanyNumberSanitizer from "../utils/company/companyNumberSanitizer";
import {
  COMPANY_CONFIRM_URL,
  COMPANY_INVALID_PAGE,
  COMPANY_SEARCH_PAGE,
  CONFIRM_URL,
  EMAIL_CHANGE_EMAIL_ADDRESS_URL,
  INVALID_COMPANY_URL,
  INVALID_URL,
  NUMBER_URL,
  REA_HOME_PAGE,
  SERVICE_UNAVAILABLE_URL
} from "../config";

import { COMPANY_PROFILE, COMPANY_NUMBER, INVALID_COMPANY_REASON } from "../constants/app.const";

import { INVALID_COMPANY_SERVICE_UNAVAILABLE } from "../constants/validation.const";

const router: Router = Router();
const routeViews: string = "router_views/company/";
const errorsConst: string = "errors";
const invalidCompanyReason: string = "invalidCompanyReason";

router.get(NUMBER_URL, (req: Request, res: Response, next: NextFunction) => {
  logger.info(`GET request to enter company number`);
  res.render(`${routeViews}` + COMPANY_SEARCH_PAGE, { backUri: REA_HOME_PAGE, userEmail: req.session?.data.signin_info?.user_profile?.email, signoutBanner: true });
});

router.post(NUMBER_URL, async (req: Request, res: Response, next: NextFunction) => {
  const formValidator = new FormValidator();
  const companyNumberSanitizer = new CompanyNumberSanitizer();
  await new CompanySearchHandler(formValidator, companyNumberSanitizer).post(req, res).then((data) => {
    // eslint-disable-next-line no-prototype-builtins
    if (Object.prototype.hasOwnProperty.call(data, errorsConst)) {
      res.render(`${routeViews}` + COMPANY_SEARCH_PAGE, data);
    } else {
      // eslint-disable-next-line no-unused-expressions
      req.session?.setExtraData(COMPANY_PROFILE, data);
      res.redirect(COMPANY_CONFIRM_URL);
    }
  });
});

router.get(config.CONFIRM_URL, async (req: Request, res: Response, next: NextFunction) => {
  new ConfirmCompanyHandler().get(req, res).then((viewData) => {
  // eslint-disable-next-line no-prototype-builtins
    if (Object.prototype.hasOwnProperty.call(viewData, errorsConst)) {
      res.render(`${routeViews}` + COMPANY_SEARCH_PAGE, viewData);
    } else {
      res.render(`${routeViews}` + CONFIRM_URL, viewData);
    }
  });
});

router.post(CONFIRM_URL, async (req: Request, res: Response, next: NextFunction) => {
  const companyProfile: CompanyProfile | undefined = req.session?.getExtraData(COMPANY_PROFILE);
  if (companyProfile !== undefined) {
    req.session?.setExtraData(COMPANY_NUMBER, companyProfile.companyNumber);
  }
  await new ConfirmCompanyHandler().post(req, res).then((data) => {
    if (Object.prototype.hasOwnProperty.call(data, invalidCompanyReason)) {
      if (data.invalidCompanyReason === INVALID_COMPANY_SERVICE_UNAVAILABLE) {
        res.redirect(SERVICE_UNAVAILABLE_URL);
      } else {
        req.session?.setExtraData(INVALID_COMPANY_REASON, data.invalidCompanyReason);
        res.redirect(INVALID_COMPANY_URL);
      }
    } else {
      res.redirect(EMAIL_CHANGE_EMAIL_ADDRESS_URL);
    }
  });
});

router.get(INVALID_URL, async (req: Request, res: Response, next: NextFunction) => {
  await new InvalidCompanyHandler().get(req, res).then((data) => {
    res.render(`${routeViews}` + COMPANY_INVALID_PAGE, data);
  });
});

export default router;
