import {NextFunction, Request, Response, Router} from "express";
import {ChangeEmailAddressHandler} from "./handlers/email/changeEmailAddress";
import {UpdateSubmittedHandler} from "./handlers/email/updateSubmitted";
import FormValidator from "../utils/common/formValidator.util";
import {CheckAnswerHandler} from "./handlers/email/checkAnswer";

import {
  CHANGE_EMAIL_ADDRESS_URL,
  CHECK_ANSWER_URL,
  EMAIL_CHECK_ANSWER_URL,
  THERE_IS_A_PROBLEM_URL,
  EMAIL_UPDATE_SUBMITTED_URL,
  UPDATE_SUBMITTED
} from "../config";

import { CONFIRM_EMAIL_CHANGE_ERROR } from "../constants/app.const";

const emailRouter: Router = Router();
const emailRouterViews: string = "router_views/email/";

// GET: /change-email-address
emailRouter.get(CHANGE_EMAIL_ADDRESS_URL, async (req: Request, res: Response, next: NextFunction) => {
  const formValidator = new FormValidator();
  const handler = new ChangeEmailAddressHandler(
    formValidator,
    req.session?.data.signin_info?.user_profile?.email
  );
  await handler.get(req, res).then((viewData) => {
    res.render(`${emailRouterViews}` + CHANGE_EMAIL_ADDRESS_URL, viewData);
  }).catch((viewData) => {
    res.redirect(THERE_IS_A_PROBLEM_URL);
  });
});

// POST: /change-email-address
emailRouter.post(CHANGE_EMAIL_ADDRESS_URL, async (req: Request, res: Response, next: NextFunction) => {
  const formValidator = new FormValidator();
  const handler = new ChangeEmailAddressHandler(
    formValidator,
    req.session?.data.signin_info?.user_profile?.email
  );
  await handler.post(req, res).then((viewData) => {
    res.redirect(EMAIL_CHECK_ANSWER_URL);
  }).catch((viewData) => {
    res.render(`${emailRouterViews}` + CHANGE_EMAIL_ADDRESS_URL, viewData);
  });
});

// GET: /check-your-answers
emailRouter.get(CHECK_ANSWER_URL, async (req: Request, res: Response, next: NextFunction) => {
  await new CheckAnswerHandler().get(req, res)
    .then((viewData) => {
      res.render(`${emailRouterViews}` + CHECK_ANSWER_URL, viewData);
    });
});

// POST: /check-your-answers
emailRouter.post(CHECK_ANSWER_URL, async (req: Request, res: Response, next: NextFunction) => {
  await new CheckAnswerHandler().post(req, res)
    .then(() => {
      res.redirect(EMAIL_UPDATE_SUBMITTED_URL);
    }).catch((viewData) => {
      if (viewData.statementError === CONFIRM_EMAIL_CHANGE_ERROR) {
        res.render(`${emailRouterViews}` + CHECK_ANSWER_URL, viewData);
      } else {
        res.redirect(THERE_IS_A_PROBLEM_URL);
      }
    });
});

// GET: /update-submitted
emailRouter.get(UPDATE_SUBMITTED, async (req: Request, res: Response, next: NextFunction) => {
  const handler = new UpdateSubmittedHandler();
  await handler.get(req, res).then((viewData) => {
    res.render(`${emailRouterViews}` + UPDATE_SUBMITTED, viewData);
  });
});

export default emailRouter;
