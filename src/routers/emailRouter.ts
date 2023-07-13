import { Request, Response, Router, NextFunction } from "express";
import { ChangeEmailAddressHandler } from "./handlers/email/changeEmailAddress";
import { ConfirmChangeEmailAddressHandler } from "./handlers/email/confirmEmailChange";
import { UpdateSubmittedHandler } from "./handlers/email/updateSubmitted";
import * as config from "../config/index";
import FormValidator from "../utils/formValidator.util";
import * as constants from "../constants/app.const";

const router: Router = Router();
const companyRouterViews: string = "router_views/company/";
const emailRouterViews: string = "router_views/email/";
const errorsConst: string = "errors";

// GET: /change-email-address
router.get(config.CHANGE_EMAIL_ADDRESS_URL, async (req: Request, res: Response, next: NextFunction) => {
  const formValidator = new FormValidator();
  const handler = new ChangeEmailAddressHandler(
    formValidator, 
    req.session?.data.signin_info?.user_profile?.email  
  );
  await handler.get(req, res).then((viewData) => {
    if (Object.prototype.hasOwnProperty.call(viewData, errorsConst) === true) {
      // TODO: go to "something has gone" wrong page
      res.render(`${companyRouterViews}` + config.COMPANY_SEARCH_PAGE, viewData);
    } else {
      res.render(`${emailRouterViews}` + config.CHANGE_EMAIL_ADDRESS_URL, viewData);
    }
  });
});

// POST: /change-email-address
router.post(config.CHANGE_EMAIL_ADDRESS_URL, async (req: Request, res: Response, next: NextFunction) => {
  const formValidator = new FormValidator();
  const handler = new ChangeEmailAddressHandler(
    formValidator, 
    req.session?.data.signin_info?.user_profile?.email  
  );
  await handler.post(req, res).then((viewData) => {
    if (Object.prototype.hasOwnProperty.call(viewData, errorsConst) === true) {
      res.render(`${emailRouterViews}` + config.CHANGE_EMAIL_ADDRESS_URL, viewData);
    } else {
      req.session?.setExtraData(constants.REGISTERED_EMAIL_ADDRESS, req.body.changeEmailAddress);
      res.redirect(config.EMAIL_CHECK_ANSWER_URL);
    }
  });
});

// GET: /check-your-answers
router.get(config.CHECK_ANSWER_URL, async (req: Request, res: Response, next: NextFunction) => {
  const handler = new ConfirmChangeEmailAddressHandler(
    req.session?.data.signin_info?.user_profile?.email
  );
  await handler.get(req, res).then((viewData) => {
    if (Object.prototype.hasOwnProperty.call(viewData, errorsConst) === true) {
      // TODO: go to "something has gone" wrong page
      res.render(`${companyRouterViews}` + config.COMPANY_SEARCH_PAGE, viewData);
    } else {
      res.render(`${emailRouterViews}` + config.CHECK_ANSWER_URL, viewData);
    }
  });
});

// GET: /update-submitted
router.get(config.UPDATE_SUBMITTED, async (req: Request, res: Response, next: NextFunction) => {
  const handler = new UpdateSubmittedHandler();
  await handler.get(req, res).then((viewData) => {
    res.render(`${routeViews}` + config.UPDATE_SUBMITTED, viewData);
  });
});

export default router;
