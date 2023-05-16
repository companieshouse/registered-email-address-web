import { Request, Response, Router, NextFunction } from "express";
import * as config from "../config";
import {
    home,
    signIn
} from "./handlers/index";

const router: Router = Router();
// const routeViews: string = "router_views/index";

// router.get("/registered-email-address", async (req: Request, res: Response, next: NextFunction) => {
//     const handler = new HomeHandler();
//     const viewData = await handler.execute(req, res);
// //    res.render(`${routeViews}/home`, viewData);
//     res.render(`home`, viewData);
// });

router.get(config.LANDING_URL, home.get);
router.post(config.LANDING_URL, home.post);

router.get("/registered-email-address/sign-in", signIn.get);

export default router;
