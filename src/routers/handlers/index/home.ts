import { Request, Response } from "express";
import { GenericHandler } from "./../generic";
import { logger } from "../../../utils/common/Logger";

const PAGE_TITLE = "Start";

export class HomeHandler extends GenericHandler {

  constructor () {
    super();
    this.viewData.title = PAGE_TITLE;
    this.viewData.signoutBanner = false;
  }

  get (req: Request, response: Response): Promise<Object> {
    logger.info(`GET request to serve home page`);
    return Promise.resolve(this.viewData);
  }
}
