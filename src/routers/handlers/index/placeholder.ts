import { Request, Response } from "express";
import { GenericHandler } from "./../generic";
import logger from "../../../lib/Logger";

export class PlaceholderHandler extends GenericHandler {

    constructor () {
        super();
        this.viewData.title = "Placeholder page";
    }

    get (req: Request, response: Response): Promise<Object> {
        logger.info(`GET request to serve placeholder page`);
        return Promise.resolve(this.viewData);
    }
};
