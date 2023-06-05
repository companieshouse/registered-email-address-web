import { Request, Response, Router, NextFunction, response } from "express";
import { HomeHandler } from "./handlers/index/home";
import { CompanySearchHandlerGet, CompanySearchHandlerPost } from "./handlers/company/companySearch";

import * as config from "../config/index";
import { StatusCodes } from "http-status-codes";

import CompanyDetails from "../models/companyDetails.model";

import FormValidator from "../utils/formValidator.util";
import CompanyNumberSanitizer from "../utils/companyNumberSanitizer";

const router: Router = Router();
const routeViews: string = "router_views/index/";
const companyRouteViews: string = "router_views/company/";
const errorsConst: string = "errors";
const companyDetailsConst: string = "companyDetails";

router.get(config.HOME_URL, async (req: Request, res: Response, next: NextFunction) => {
    const handler = new HomeHandler();
    const viewData = await handler.get(req, res);
    res.render(`${routeViews}` + config.HOME_PAGE, viewData);
});

router.post(config.HOME_URL, async (req: Request, res: Response, next: NextFunction) => {
    const handler = new HomeHandler();
    const viewData = await handler.post(req, res);
    res.redirect(config.COMPANY_NUMBER_URL);
});

router.get(config.COMPANY_NUMBER_URL, async (req: Request, res: Response, next: NextFunction) => {
    res.render(`${companyRouteViews}` + config.COMPANY_SEARCH_PAGE);
});

router.post(config.COMPANY_NUMBER_URL, async (req: Request, res: Response, next: NextFunction) => {
    var formValidator = new FormValidator();
    var companyNumberSanitizer = new CompanyNumberSanitizer();
    var data = await new CompanySearchHandlerPost(formValidator, companyNumberSanitizer).post(req, res).then((data) => {
        if (data.hasOwnProperty(errorsConst) == true) {
            res.render(`${companyRouteViews}` + config.COMPANY_SEARCH_PAGE, data);
        } else {
            req.session?.setExtraData(companyDetailsConst, data);
            res.redirect(StatusCodes.PERMANENT_REDIRECT, config.CONFIRM_COMPANY_URL);
        }
    });
});

router.post(config.CONFIRM_COMPANY_URL, (req: Request, res: Response, next: NextFunction) => {
    // TODO: add exception handling in the event that req.session?.getExtraData(companyDetailsConst) not set
    // return StatusCodes.BAD_REQUEST (400)
    res.render(`${companyRouteViews}` + config.CONFIRM_COMPANY_PAGE, req.session?.getExtraData(companyDetailsConst));
});

export default router;
