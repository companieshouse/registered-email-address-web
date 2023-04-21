import { Request, Response, Router, NextFunction } from "express";
import { HomeHandler } from "./handlers/index/home";
import * as config from "../config";
const router: Router = Router();
const routeViews: string = "router_views/index";

router.get(config.CHS_URL + "/registered-email-address", async (req: Request, res: Response, next: NextFunction) => {
    const handler = new HomeHandler();
    const viewData = await handler.execute(req, res);
    res.render(`${routeViews}/home`, viewData);
});

export default router;
