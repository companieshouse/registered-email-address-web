import { Request, Response } from "express";
import { GenericHandler } from "../generic";
import { logger } from "../../../utils/common/logger";
import {PIWIK_START_GOAL_ID} from "../../../config";

const PAGE_TITLE = "Start";
const EVENT = "start-event";

export class HomeHandler extends GenericHandler {

  constructor () {
    super();
    this.viewData.eventType = EVENT;
    this.viewData.title = PAGE_TITLE;
    this.viewData.signoutBanner = false;
    this.viewData.goal = PIWIK_START_GOAL_ID;
  }

  get (req: Request, response: Response): Promise<Object> {
    logger.info(`GET request to serve home page`);
    return Promise.resolve(this.viewData);
  }
}
