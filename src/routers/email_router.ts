import {NextFunction, Request, Response, Router} from "express";
import {ChangeEmailAddressHandler} from "./handlers/email/change_email_address";
import {UpdateSubmittedHandler} from "./handlers/email/update_submitted";
import FormValidator from "../utils/common/form_validator";
import {CheckAnswerHandler} from "./handlers/email/check_answer";

import {
  CHANGE_EMAIL_ADDRESS_URL,
  CHECK_ANSWER_URL,
  EMAIL_CHECK_ANSWER_URL,
  EMAIL_UPDATE_SUBMITTED_URL,
  THERE_IS_A_PROBLEM_URL,
  UPDATE_SUBMITTED
} from "../config";

import {CONFIRMATION_STATEMENT_RETURN_URL, CONFIRM_EMAIL_CHANGE_ERROR, RETURN_TO_CONFIRMATION_STATEMENT} from "../constants/app_const";

const email_router: Router = Router();
const emailRouterViews: string = "router-views/email/";

// GET: /change-email-address
email_router.get(CHANGE_EMAIL_ADDRESS_URL, async (req: Request, res: Response, next: NextFunction) => {
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
email_router.post(CHANGE_EMAIL_ADDRESS_URL, async (req: Request, res: Response, next: NextFunction) => {
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
email_router.get(CHECK_ANSWER_URL, async (req: Request, res: Response, next: NextFunction) => {
  await new CheckAnswerHandler().get(req, res)
    .then((viewData) => {
      res.render(`${emailRouterViews}` + CHECK_ANSWER_URL, viewData);
    });
});

// POST: /check-your-answers
email_router.post(CHECK_ANSWER_URL, async (req: Request, res: Response, next: NextFunction) => {
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
email_router.get(UPDATE_SUBMITTED, async (req: Request, res: Response, next: NextFunction) => {
  const handler = new UpdateSubmittedHandler();
  await handler.get(req, res).then((viewData) => {
    res.render(`${emailRouterViews}` + UPDATE_SUBMITTED, viewData);
  });
});

// POST: /update-submitted
email_router.post(UPDATE_SUBMITTED, async (req: Request, res: Response, next: NextFunction) => {
  const handler = new UpdateSubmittedHandler();
  await handler.post(req, res).then((viewData) => {
    const confirmationStatementReturnUrl: string = req.session?.getExtraData(CONFIRMATION_STATEMENT_RETURN_URL) as string;
    if (confirmationStatementReturnUrl) {
      res.redirect(confirmationStatementReturnUrl);
    } else {
      res.redirect(THERE_IS_A_PROBLEM_URL);
    }
  });
});

export default email_router;
