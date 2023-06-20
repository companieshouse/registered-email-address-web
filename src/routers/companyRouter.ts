import { Request, Response, Router, NextFunction } from "express";
import { CompanySearchHandlerPost } from "./handlers/company/companySearch";
import { ConfirmCompanyHandler } from "./handlers/company/confirm";

import * as config from "../config/index";
import logger from "../lib/Logger";

import FormValidator from "../utils/formValidator.util";
import CompanyNumberSanitizer from "../utils/companyNumberSanitizer";

const router: Router = Router();

const routeViews: string = "router_views/company/";
const errorsConst: string = "errors";
const companyDetailsConst: string = "companyDetails";

router.get(config.NUMBER_URL, async (req: Request, res: Response, next: NextFunction) => {
    logger.info(`GET request to enter company number`);
    res.render(`${routeViews}` + config.COMPANY_SEARCH_PAGE);
    // alternatively use this to call the Company lookup service:
    // return res.redirect(config.COMPANY_LOOKUP);
});

router.post(config.NUMBER_URL, async (req: Request, res: Response, next: NextFunction) => {
    var formValidator = new FormValidator();
    var companyNumberSanitizer = new CompanyNumberSanitizer();
    var data = await new CompanySearchHandlerPost(formValidator, companyNumberSanitizer).post(req, res).then((data) => {
        // eslint-disable-next-line no-prototype-builtins
        if (data.hasOwnProperty(errorsConst) === true) {
            res.render(`${routeViews}` + config.COMPANY_SEARCH_PAGE, data);
        } else {
            // eslint-disable-next-line no-unused-expressions
            req.session?.setExtraData(companyDetailsConst, data);
            res.redirect(config.COMPANY_CONFIRM_URL);
        }
    });
});

router.get(config.CONFIRM_URL, async (req: Request, res: Response, next: NextFunction) => {
    const handler = new ConfirmCompanyHandler();
    const viewData = await handler.get(req, res);
    res.render(`${routeViews}` + config.CONFIRM_URL, viewData);
});

router.post(config.CONFIRM_URL, async (req: Request, res: Response, next: NextFunction) => {
    const handler = new ConfirmCompanyHandler();
    const viewData = await handler.post(req, res);
    res.redirect(config.VIEW_COMPANY_INFORMATION_URI);
});

export default router;
