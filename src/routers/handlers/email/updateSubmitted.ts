import { Request, Response } from "express";
import { GenericHandler } from "../generic";
import { logger } from "../../../utils/common/Logger";
import { Session } from "@companieshouse/node-session-handler";
import { SUBMISSION_ID } from "../../../constants/app.const";

export class UpdateSubmittedHandler extends GenericHandler {

  constructor () {
    super();
  }
  
  async get (req: Request, response: Response): Promise<Object> {
    logger.info(`GET request to serve update submitted page`);
    const session: Session = req.session as Session;
    this.viewData.userEmail = session.data.signin_info?.user_profile?.email;
    this.viewData.submissionID = session.getExtraData(SUBMISSION_ID);
    return Promise.resolve(this.viewData);
  }
}

