import { Request, Response } from "express";
import { GenericHandler } from "./../generic";
import logger from "../../../lib/Logger";

export class ChangeEmailAddressHandler extends GenericHandler {

    constructor () {
        super();
        this.viewData.title = "Update a registered email address";
    }

    async get (req: Request, response: Response): Promise<Object> {
        logger.info(`GET request to serve change registered email address page`);
        this.viewData.email_address = "test.name@email.ie";
        return Promise.resolve(this.viewData);
    }

    post (req: Request, response: Response): Promise<Object> {
        logger.info(`POST request to serve change registered email address page`);
        return Promise.resolve(this.viewData);
    }
};
