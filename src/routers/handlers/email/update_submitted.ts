import {Request, Response} from "express";
import {GenericHandler} from "../generic";
import {logger} from "../../../utils/common/logger";
import {Session} from "@companieshouse/node-session-handler";
import {
  COMPANY_NUMBER,
  COMPANY_PROFILE,
  INVALID_COMPANY_REASON,
  NEW_EMAIL_ADDRESS,
  REGISTERED_EMAIL_ADDRESS,
  REGISTERED_EMAIL_ADDRESS_SUBMITTED,
  RETURN_TO_CONFIRMATION_STATEMENT,
  SUBMISSION_ID
} from "../../../constants/app_const";
import {ACCOUNT_URL, CONFIRMATION_FEEDBACK_LINK, WEBFILING_URL} from "../../../config";

const EVENT = "update-submitted-event";
const PAGE_TITLE = "Application submitted – Update a registered email address";

export class UpdateSubmittedHandler extends GenericHandler {

  constructor() {
    super();
    this.viewData.eventType = EVENT;
    this.viewData.title = PAGE_TITLE;
    this.viewData.feedback = CONFIRMATION_FEEDBACK_LINK;
  }

  async get(req: Request, response: Response): Promise<Object> {
    logger.info(`GET request to serve update submitted page`);
    const session: Session = req.session as Session;
    this.viewData.userEmail = session.data.signin_info?.user_profile?.email;
    this.viewData.userAccountUrl = ACCOUNT_URL + "/user/account";
    this.viewData.webfilingLoginUrl = WEBFILING_URL + "account/login/?realm=/alpha&amp;service=CHWebFiling-Login&amp;authIndexType=service&amp;authIndexValue=CHWebFiling-Login";
    this.viewData.backUri = undefined;
    this.viewData.submissionID = session.getExtraData(SUBMISSION_ID);
    this.viewData.returnToConfirmationStatement = session.getExtraData(RETURN_TO_CONFIRMATION_STATEMENT);

    // clear session.ExtraData
    session.setExtraData(COMPANY_PROFILE, undefined);
    session.setExtraData(COMPANY_NUMBER, undefined);
    session.setExtraData(REGISTERED_EMAIL_ADDRESS, undefined);
    session.setExtraData(NEW_EMAIL_ADDRESS, undefined);
    session.setExtraData(INVALID_COMPANY_REASON, undefined);

    return Promise.resolve(this.viewData);
  }

  async post(req: Request, response: Response): Promise<any> {
    logger.info(`POST return to confirmation statement`);
    const session: Session = req.session as Session;
    const returnToConfirmationStatement: boolean = session.getExtraData(RETURN_TO_CONFIRMATION_STATEMENT) as boolean;

    if (returnToConfirmationStatement === true) {
      session.setExtraData(REGISTERED_EMAIL_ADDRESS_SUBMITTED, true);
    }

    return Promise.resolve(this.viewData);
  }
}

