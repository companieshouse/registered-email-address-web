import { Request, Response, NextFunction } from "express";
import { GenericHandler } from "./../generic";
import logger from "../../../lib/Logger";

export const get = (req: Request, res: Response, _: NextFunction) => {
    return res.render("sign-in", {
        backLinkUrl: "placeholder",
        templateName: "sign-in"
    });
};
