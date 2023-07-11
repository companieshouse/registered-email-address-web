import {NextFunction, Request, Response, Router} from "express";
import {ChangeEmailAddressHandler} from "./handlers/email/changeEmailAddress";
import * as config from "../config/index";
import {CHECK_ANSWER_URL, SUBMITTED_URL} from "../config/index";
import FormValidator from "../utils/formValidator.util";
import * as constants from "../constants/app.const";
import {processGetCheckRequest, processPostCheckRequest} from "../services/company/company.email.service";

const router: Router = Router();
const routeViews: string = "router_views/email/";
const errorsConst: string = "statementError";

// GET: /change-email-address
router.get(config.CHANGE_EMAIL_ADDRESS_URL, async (req: Request, res: Response, next: NextFunction) => {
    const formValidator = new FormValidator();
    const handler = new ChangeEmailAddressHandler(
        formValidator,
        req.session?.data.signin_info?.user_profile?.email
    );
    await handler.get(req, res).then((viewData) => {
        res.render(`router_views/email/${config.CHANGE_EMAIL_ADDRESS_URL}`, viewData);
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
            res.render(`${routeViews}` + config.CHANGE_EMAIL_ADDRESS_URL, viewData);
        } else {
            req.session?.setExtraData(constants.UPDATED_COMPANY_EMAIL, req.body.changeEmailAddress);
            res.redirect(config.EMAIL_CHECK_ANSWER_URL);
        }
    });
});

// GET: /check-your-answers
router.get(CHECK_ANSWER_URL, async (req: Request, res: Response, next: NextFunction) => {
    const viewData = await processGetCheckRequest(req);

    return res.render(`${routeViews}` + CHECK_ANSWER_URL, viewData);
});

// POST: /check-your-answers
router.post(CHECK_ANSWER_URL, async (req: Request, res: Response, next: NextFunction) => {
    const viewData = await processPostCheckRequest(req);

    if (Object.prototype.hasOwnProperty.call(viewData, errorsConst) === true) {
        res.render(`${routeViews}` + CHECK_ANSWER_URL, viewData);
    } else {
        res.render(`${routeViews}` + SUBMITTED_URL, viewData);
    }
});

export default router;
