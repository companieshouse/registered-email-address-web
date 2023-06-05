import { Request, Response, Router, NextFunction, response } from "express";
import { HomeHandler } from "./handlers/index/home";
import { CompanySearchHandlerGet } from "./handlers/index/companySearch";
import { CompanySearchHandlerPost } from "./handlers/index/companySearch";
import * as config from "../config/index";

import FormValidator from "../utils/formValidator.util";
import CompanyNumberSanitizer from "../utils/companyNumberSanitizer";

const router: Router = Router();
const routeViews: string = "router_views/index/";
const companyRouteViews: string = "router_views/company/";

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
    var viewData = new CompanySearchHandlerGet().get(req, res);
    res.render(`${companyRouteViews}` + config.COMPANY_SEARCH_PAGE, viewData);
});

router.post(config.COMPANY_NUMBER_URL, async (req: Request, res: Response, next: NextFunction) => {
    var formValidator = new FormValidator();
    var companyNumberSanitizer = new CompanyNumberSanitizer();
    var viewData = await new CompanySearchHandlerPost(formValidator, companyNumberSanitizer).post(req, res);
    if (viewData.hasOwnProperty('errors') == true) {
        res.render(`${companyRouteViews}` + config.COMPANY_SEARCH_PAGE, viewData);
    } else {
        res.render(`${companyRouteViews}` + config.CONFIRM_COMPANY_PAGE, viewData);
    }
});

export default router;
