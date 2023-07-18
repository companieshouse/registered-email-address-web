import {NextFunction, Request, Response, Router} from "express";
import { ChangeEmailAddressHandler } from "./handlers/email/changeEmailAddress";
import { UpdateSubmittedHandler } from "./handlers/email/updateSubmitted";
import {CHANGE_EMAIL_ADDRESS_URL, EMAIL_CHECK_ANSWER_URL} from "../config/index";
import {CHECK_ANSWER_URL, EMAIL_UPDATE_SUBMITTED_URL, UPDATE_SUBMITTED} from "../config";
import FormValidator from "../utils/formValidator.util";
import * as constants from "../constants/app.const";

import {CheckAnswerHandler} from "./handlers/email/checkAnswer";

const router: Router = Router();
const routeViews: string = "router_views/email/";
const statementErrorsConst: string = "statementError";
const errorsConst: string = "errors";

// GET: /change-email-address
router.get(CHANGE_EMAIL_ADDRESS_URL, async (req: Request, res: Response, next: NextFunction) => {
  const formValidator = new FormValidator();
  const handler = new ChangeEmailAddressHandler(
    formValidator,
    req.session?.data.signin_info?.user_profile?.email
  );
  await handler.get(req, res).then((viewData) => {
    res.render(`router_views/email/${CHANGE_EMAIL_ADDRESS_URL}`, viewData);
  });
});

// POST: /change-email-address
router.post(CHANGE_EMAIL_ADDRESS_URL, async (req: Request, res: Response, next: NextFunction) => {
  const formValidator = new FormValidator();
  const handler = new ChangeEmailAddressHandler(
    formValidator,
    req.session?.data.signin_info?.user_profile?.email
  );
  await handler.post(req, res).then((viewData) => {
    if (Object.prototype.hasOwnProperty.call(viewData, errorsConst)) {
      res.render(`${routeViews}` + CHANGE_EMAIL_ADDRESS_URL, viewData);
    } else {
      req.session?.setExtraData(constants.COMPANY_EMAIL, req.body.changeEmailAddress);
      res.redirect(EMAIL_CHECK_ANSWER_URL);
    }
  });
});

// GET: /check-your-answers
router.get(CHECK_ANSWER_URL, async (req: Request, res: Response, next: NextFunction) => {
    await new CheckAnswerHandler().get(req, res)
        .then((viewData) => {
            res.render(`${routeViews}` + CHECK_ANSWER_URL, viewData);
        });
});

// POST: /check-your-answers
router.post(CHECK_ANSWER_URL, async (req: Request, res: Response, next: NextFunction) => {
    await new CheckAnswerHandler().post(req, res)
        .then((viewData)             => {
            if (Object.prototype.hasOwnProperty.call(viewData, errorsConst) ||
                Object.prototype.hasOwnProperty.call(viewData, statementErrorsConst)) {
                res.render(`${routeViews}` + CHECK_ANSWER_URL, viewData);
            } else {
                res.redirect(EMAIL_UPDATE_SUBMITTED_URL);
            }
        });
});

// GET: /update-submitted
router.get(UPDATE_SUBMITTED, async (req: Request, res: Response, next: NextFunction) => {
    const handler = new UpdateSubmittedHandler();
    await handler.get(req, res).then((viewData) => {
        res.render(`${routeViews}` + UPDATE_SUBMITTED, viewData);
    });
});

export default router;
