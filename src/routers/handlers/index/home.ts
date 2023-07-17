import { Request, Response } from "express";
import { GenericHandler } from "./../generic";
import { logger } from "../../../lib/Logger";

export class HomeHandler extends GenericHandler {

  constructor () {
    super();
    this.viewData.title = "Update a registered email address";
    this.viewData.signoutBanner = false;
  }

  get (req: Request, response: Response): Promise<Object> {
    logger.info(`GET request to serve home page`);
    return Promise.resolve(this.viewData);
  }
}
