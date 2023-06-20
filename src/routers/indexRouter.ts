import { Request, Response, Router, NextFunction, response } from "express";
import { HomeHandler } from "./handlers/index/home";
import * as config from "../config/index";

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

export default router;
