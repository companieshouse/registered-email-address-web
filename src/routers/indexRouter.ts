import { Request, Response, Router, NextFunction } from "express";
import { HomeHandler } from "./handlers/index/home";
import { PlaceholderHandler } from "./handlers/index/placeholder";
import * as config from "../config/index";
// import { authentication } from "../middleware/authSignin.middleware";
const router: Router = Router();
const routeViews: string = "router_views/index/";

router.get(config.HOME_URL, async (req: Request, res: Response, next: NextFunction) => {
    const handler = new HomeHandler();
    const viewData = await handler.get(req, res);
    res.render(`${routeViews}` + config.HOME_PAGE, viewData);
});

router.post(config.HOME_URL, async (req: Request, res: Response, next: NextFunction) => {
    const handler = new HomeHandler();
    const viewData = await handler.post(req, res);
    res.redirect(config.PLACEHOLDER_URL);
});

router.get(config.PLACEHOLDER_URL, async (req: Request, res: Response, next: NextFunction) => {
    const handler = new PlaceholderHandler();
    const viewData = await handler.get(req, res);
    res.render(`${routeViews}` + config.PLACEHOLDER_PAGE, viewData);
});

export default router;
