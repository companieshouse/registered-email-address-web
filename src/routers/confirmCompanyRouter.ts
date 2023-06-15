import { Request, Response, Router, NextFunction } from "express";
import { Templates } from "../types/template.paths";
import { ConfirmCompanyHandler } from "./handlers/confirmCompanyHandler";
import * as config from "../config/index";
const router: Router = Router();

// TODO point to correct display?
const routeViews: string = "router_views/index/";

router.get(config.CONFIRM_COMPANY_URL, async (req: Request, res: Response, next: NextFunction) => {
    const handler = new ConfirmCompanyHandler();
    const viewData = await handler.get(req, res);
    res.render(Templates.CONFIRM_COMPANY, viewData);
});

router.post(config.CONFIRM_COMPANY_URL, async (req: Request, res: Response, next: NextFunction) => {
    const handler = new ConfirmCompanyHandler();
    const viewData = await handler.post(req, res);
    res.redirect(config.PLACEHOLDER_URL);
});

export default router;
