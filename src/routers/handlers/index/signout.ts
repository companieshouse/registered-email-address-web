import { Request, Response } from "express";
import { GenericHandler } from "../generic";
import { Session } from "@companieshouse/node-session-handler";
import {RETURN_URL} from "../../../constants/app.const";
import logger from "../../../lib/Logger";
export class SignOutHandler extends GenericHandler {

  constructor () {
    super();
  }

  get (req: Request, response: Response): Promise<Object> {
    logger.info(`GET request to serve signout page`);
    return Promise.resolve(this.viewData);
  }

  default (req: Request, response: Response): Promise<Object> {
    this.viewData.backUri = getReturnPageFromSession(req);
    this.viewData.noInputSelectedError = true;
    logger.info(`POST request to serve signout page`);
    return Promise.resolve(this.viewData);
  }
}

export function getReturnPageFromSession(req: Request): string {
  const session: Session = req.session as Session;
  const returnPage =  session.getExtraData(RETURN_URL);
  if (returnPage !== undefined && typeof returnPage === 'string') {
    return returnPage;
  }
  logger.error(`Unable to find page to return the user to. ` 
      + `It should have been a string value stored in the session extra data with key ${RETURN_URL}. ` 
      + `However, ${JSON.stringify(returnPage)} was there instead.`);
  throw new Error(`Cannot find url of page to return user to.`);
}

