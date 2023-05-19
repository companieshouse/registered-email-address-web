import { Request, Response, NextFunction } from "express";
import logger from "../../../lib/Logger";
import * as config from "../../../config";

export const get = (req: Request, res: Response, _: NextFunction) => {
    logger.debugRequest(req, `GET ${config.LANDING_PAGE}`);

    return res.render(config.LANDING_PAGE, {
        backLinkUrl: "placeholder",
        templateName: config.LANDING_PAGE
    });
};

export const post = (req: Request, res: Response, _: NextFunction) => {
    logger.debugRequest(req, `POST ${config.LANDING_PAGE}`);

    return res.redirect(config.SIGN_IN_URL);
};
