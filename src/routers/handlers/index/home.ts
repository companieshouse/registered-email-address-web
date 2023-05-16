import { Request, Response, NextFunction } from "express";
import { GenericHandler } from "./../generic";
import logger from "../../../lib/Logger";
import * as config from "../../../config";

// export class HomeHandler extends GenericHandler {

//     constructor () {
//         super();
//         this.viewData.title = "Home handler for index router";
//         this.viewData.sampleKey = "sample value for home page screen";
//     }

//     execute (req: Request, response: Response): Promise<Object> {
//         logger.info(`GET request to serve home page`);
//         // ...process request here and return data for the view
//         return Promise.resolve(this.viewData);
//     }
// };

export const get = (req: Request, res: Response, _: NextFunction) => {
    return res.render(config.LANDING_PAGE, {
        backLinkUrl: "placeholder",
        templateName: config.LANDING_PAGE
    });
};

export const post = (req: Request, res: Response, _: NextFunction) => {
    return res.redirect("/registered-email-address/sign-in");
};
