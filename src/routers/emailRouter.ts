import {NextFunction, Request, Response, Router} from "express";
import {ChangeEmailAddressHandler} from "./handlers/email/changeEmailAddress";
import {UpdateSubmittedHandler} from "./handlers/email/updateSubmitted";
import FormValidator from "../utils/common/formValidator.util";
import {CheckAnswerHandler} from "./handlers/email/checkAnswer";

import {
  CHANGE_EMAIL_ADDRESS_URL,
  CHECK_ANSWER_URL,
  THERE_IS_A_PROBLEM_URL,
  EMAIL_UPDATE_SUBMITTED_URL,
  UPDATE_SUBMITTED
} from "../config";
import {requestFailed} from "../utils/general";

const router: Router = Router();
const emailRouterViews: string = "router_views/email/";

// GET: /change-email-address
router.get(CHANGE_EMAIL_ADDRESS_URL, async (req: Request, res: Response, next: NextFunction) => {
  const formValidator = new FormValidator();
  const handler = new ChangeEmailAddressHandler(
    formValidator,
    req.session?.data.signin_info?.user_profile?.email
  );
  await handler.get(req, res).then((viewData) => {
    if (requestFailed(viewData)) {
      // TODO: go to "something has gone" wrong page
      res.render(THERE_IS_A_PROBLEM_URL, viewData);
    } else {
      res.render(`${emailRouterViews}` + CHANGE_EMAIL_ADDRESS_URL, viewData);
    }
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
    if (requestFailed(viewData)) {
      res.render(`${emailRouterViews}` + CHANGE_EMAIL_ADDRESS_URL, viewData);
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
      if (requestFailed(viewData)) {
        res.render(`${emailRouterViews}` + CHECK_ANSWER_URL, viewData);
      } else {
        res.redirect(EMAIL_UPDATE_SUBMITTED_URL);
      }
    });
});

// GET: /update-submitted
router.get(UPDATE_SUBMITTED, async (req: Request, res: Response, next: NextFunction) => {
  const handler = new UpdateSubmittedHandler();
  await handler.get(req, res).then((viewData) => {
    res.render(`${emailRouterViews}` + UPDATE_SUBMITTED, viewData);
  });
});

export default router;
