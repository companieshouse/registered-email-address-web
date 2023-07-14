import { Request, Response, Router, NextFunction } from "express";
import { CompanySearchHandlerPost } from "./handlers/company/companySearch";
import { ConfirmCompanyHandler } from "./handlers/company/confirm";
import { InvalidCompanyHandler } from "./handlers/company/invalidCompany";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import * as config from "../config/index";
import { logger } from "../lib/Logger";
import FormValidator from "../utils/formValidator.util";
import CompanyNumberSanitizer from "../utils/companyNumberSanitizer";
import * as constants from "../constants/app.const";

const router: Router = Router();
const routeViews: string = "router_views/company/";
const errorsConst: string = "errors";
const invalidCompanyReason: string = "invalidCompanyReason";

router.get(config.NUMBER_URL, (req: Request, res: Response, next: NextFunction) => {
  logger.info(`GET request to enter company number`);
  res.render(`${routeViews}` + config.COMPANY_SEARCH_PAGE, { backUri: config.REA_HOME_PAGE, userEmail: req.session?.data.signin_info?.user_profile?.email, signoutBanner: true });
});

router.post(config.NUMBER_URL, async (req: Request, res: Response, next: NextFunction) => {
  const formValidator = new FormValidator();
  const companyNumberSanitizer = new CompanyNumberSanitizer();
  await new CompanySearchHandlerPost(formValidator, companyNumberSanitizer).post(req, res).then((data) => {
    // eslint-disable-next-line no-prototype-builtins
    if (Object.prototype.hasOwnProperty.call(data, errorsConst)) {
      res.render(`${routeViews}` + config.COMPANY_SEARCH_PAGE, data);
    } else {
      // eslint-disable-next-line no-unused-expressions
      req.session?.setExtraData(constants.COMPANY_PROFILE, data);
      res.redirect(config.COMPANY_CONFIRM_URL);
    }
  });
});

router.get(config.CONFIRM_URL, async (req: Request, res: Response, next: NextFunction) => {
  const handler = new ConfirmCompanyHandler();
  const viewData = await handler.get(req, res);
  // eslint-disable-next-line no-prototype-builtins
  if (Object.prototype.hasOwnProperty.call(viewData, errorsConst)) {
    res.render(`${routeViews}` + config.COMPANY_SEARCH_PAGE, viewData);
  } else {
    res.render(`${routeViews}` + config.CONFIRM_URL, viewData);
  }
});

router.post(config.CONFIRM_URL, async (req: Request, res: Response, next: NextFunction) => {
  const companyProfile: CompanyProfile | undefined = req.session?.getExtraData("companyProfile");
  if (companyProfile !== undefined) {
    req.session?.setExtraData("companyNumber", companyProfile.companyNumber);
  }
  const handler = new ConfirmCompanyHandler();
  await handler.post(req, res).then((data) => {
    if (Object.prototype.hasOwnProperty.call(data, invalidCompanyReason)) {
      req.session?.setExtraData(constants.INVALID_COMPANY_REASON, data.invalidCompanyReason);
      res.redirect(config.INVALID_COMPANY_URL);
    } else {
      res.redirect(config.EMAIL_CHANGE_EMAIL_ADDRESS_URL);
    }
  });
});

router.get(config.INVALID_URL, async (req: Request, res: Response, next: NextFunction) => {
  const handler = new InvalidCompanyHandler();
  await handler.get(req, res).then((data) => {
    res.render(`${routeViews}` + config.COMPANY_INVALID_PAGE, data);
  });
});

export default router;
