import { Request, Response } from "express";
import { GenericHandler } from "./../generic";
import logger from "../../../lib/Logger";

export class HomeHandler extends GenericHandler {

  constructor () {
    super();
    this.viewData.title = "Update a registered company email address";
  }

  get (req: Request, response: Response): Promise<Object> {
    logger.info(`GET request to serve home page`);
    return Promise.resolve(this.viewData);
  }

  post (req: Request, response: Response): Promise<Object> {
    logger.info(`POST request to serve home page`);
    return Promise.resolve(this.viewData);
  }
}
