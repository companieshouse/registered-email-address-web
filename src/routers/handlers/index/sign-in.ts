import { Request, Response, NextFunction } from "express";
import logger from "../../../lib/Logger";
import * as config from "../../../config";

export const get = (req: Request, res: Response, _: NextFunction) => {
    logger.debugRequest(req, `GET ${config.SIGN_IN_PAGE}`);

    return res.render(config.SIGN_IN_PAGE, {
        backLinkUrl: "placeholder",
        templateName: config.SIGN_IN_PAGE
    });
};
