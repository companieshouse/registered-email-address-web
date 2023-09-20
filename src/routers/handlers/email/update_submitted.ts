import { Request, Response } from "express";
import { GenericHandler } from "../generic";
import { logger } from "../../../utils/common/logger";
import { Session } from "@companieshouse/node-session-handler";
import {
  COMPANY_PROFILE,
  COMPANY_NUMBER,
  REGISTERED_EMAIL_ADDRESS,
  NEW_EMAIL_ADDRESS,
  INVALID_COMPANY_REASON,
  SUBMISSION_ID
} from "../../../constants/app_const";
import {CONFIRMATION_FEEDBACK_LINK} from "../../../config";

const EVENT = "update-submitted-event";
const PAGE_TITLE = "Application submitted – Update a registered email address";

export class UpdateSubmittedHandler extends GenericHandler {

  constructor () {
    super();
    this.viewData.eventType = EVENT;
    this.viewData.title = PAGE_TITLE;
    this.viewData.survey = CONFIRMATION_FEEDBACK_LINK;
  }
  
  async get (req: Request, response: Response): Promise<Object> {
    logger.info(`GET request to serve update submitted page`);
    const session: Session = req.session as Session;
    this.viewData.userEmail = session.data.signin_info?.user_profile?.email;
    this.viewData.backUri = undefined;
    this.viewData.submissionID = session.getExtraData(SUBMISSION_ID);

    // clear session.ExtraData
    session.setExtraData(COMPANY_PROFILE, undefined);
    session.setExtraData(COMPANY_NUMBER, undefined);
    session.setExtraData(REGISTERED_EMAIL_ADDRESS, undefined);
    session.setExtraData(NEW_EMAIL_ADDRESS, undefined);
    session.setExtraData(INVALID_COMPANY_REASON, undefined);

    return Promise.resolve(this.viewData);
  }
}

