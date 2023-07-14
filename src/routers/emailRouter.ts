import {NextFunction, Request, Response, Router} from "express";
import { ChangeEmailAddressHandler } from "./handlers/email/changeEmailAddress";
import { UpdateSubmittedHandler } from "./handlers/email/updateSubmitted";
import * as config from "../config/index";
import {CHECK_ANSWER_URL} from "../config";
import FormValidator from "../utils/formValidator.util";
import * as constants from "../constants/app.const";

import {CheckAnswerHandler} from "./handlers/email/checkAnswer";
import {EMAIL_UPDATE_SUBMITTED_URL, UPDATE_SUBMITTED} from "../config";
import {EMAIL_UPDATE_SUBMITTED} from "../config/index";

const router: Router = Router();
const companyRouterViews: string = "router_views/company/";
const emailRouterViews: string = "router_views/email/";
const statementErrorsConst: string = "statementError";
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
    if (Object.prototype.hasOwnProperty.call(viewData, errorsConst)) {
      res.render(`${emailRouterViews}` + config.CHANGE_EMAIL_ADDRESS_URL, viewData);
    } else {
      req.session?.setExtraData(constants.REGISTERED_EMAIL_ADDRESS, req.body.changeEmailAddress);
      res.redirect(config.EMAIL_CHECK_ANSWER_URL);
    }
  });
});

// GET: /check-your-answers
router.get(CHECK_ANSWER_URL, async (req: Request, res: Response, next: NextFunction) => {
  await new CheckAnswerHandler().get(req, res)
    .then((viewData) => {
      res.render(`${emailRouterViews}` + CHECK_ANSWER_URL, viewData);
    });
});

// POST: /check-your-answers
router.post(CHECK_ANSWER_URL, async (req: Request, res: Response, next: NextFunction) => {
  await new CheckAnswerHandler().post(req, res)
    .then((viewData) => {
      if (Object.prototype.hasOwnProperty.call(viewData, errorsConst) ||
                Object.prototype.hasOwnProperty.call(viewData, statementErrorsConst)) {
        res.render(`${emailRouterViews}` + CHECK_ANSWER_URL, viewData);
      } else {
        res.render(`${emailRouterViews}` + UPDATE_SUBMITTED, viewData);
      }
    });
});

// GET: /update-submitted
router.get(config.UPDATE_SUBMITTED, async (req: Request, res: Response, next: NextFunction) => {
  const handler = new UpdateSubmittedHandler();
  await handler.get(req, res).then((viewData) => {
    res.render(`${emailRouterViews}` + config.UPDATE_SUBMITTED, viewData);
  });
});

export default router;
