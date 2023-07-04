import { Request, Response, Router, NextFunction, response } from "express";
import { HomeHandler } from "./handlers/index/home";
import { SignOutHandler, getReturnPageFromSession } from "./handlers/index/signout";
import {RETURN_URL} from "../constants/app.const";
import * as config from "../config/index";

const router: Router = Router();
const routeViews: string = "router_views/index/";

router.get(config.HOME_URL, async (req: Request, res: Response, next: NextFunction) => {
  const handler = new HomeHandler();
  const viewData = await handler.get(req, res);
  res.render(`${routeViews}` + config.HOME_PAGE, viewData);
});

router.post(config.HOME_URL, (req: Request, res: Response, next: NextFunction) => {
  const handler = new HomeHandler();
  res.redirect(config.COMPANY_NUMBER_URL);
});

router.get(config.SIGN_OUT_URL, async (req: Request, res: Response, next: NextFunction) => {
  req.session?.setExtraData(RETURN_URL, req.get("Referrer"));
  const handler = new SignOutHandler();
  const viewData = await handler.get(req, res);
  res.render(`${routeViews}` + config.SIGN_OUT_PAGE, viewData);
});

router.post(config.SIGN_OUT_URL, async (req: Request, res: Response, next: NextFunction) => {
  const handler = new SignOutHandler();
  switch (req.body.signout) {
      case "yes": {
        return res.redirect(config.ACCOUNTS_SIGNOUT_PATH);
      }
      case "no": {
        return res.redirect(getReturnPageFromSession(req));
      }
      default: {
        const viewData = await handler.default(req, res);
        res.render(`${routeViews}` + config.SIGN_OUT_PAGE, viewData);
      }
  }
});

export default router;
