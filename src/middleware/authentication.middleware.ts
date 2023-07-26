import { NextFunction, Request, Response } from "express";
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { Session } from "@companieshouse/node-session-handler";
import { CHS_URL } from "../config/index";
import { logger } from '../utils/common/Logger';
import { ACCOUNTS_SIGNOUT_PATH, COMPANY_NUMBER_URL } from '../config';
import { NOT_SIGNED_IN_ERROR } from "../constants/app.const";
import { checkUserSignedIn } from "../utils/middleware/session";


export const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {

  if (req.originalUrl !== COMPANY_NUMBER_URL) {
    try {
      // Check user logged in
      const session: Session = req.session as Session;
      if (!checkUserSignedIn( session )) {
        logger.infoRequest( req, NOT_SIGNED_IN_ERROR );
        return res.redirect( ACCOUNTS_SIGNOUT_PATH );
      }

    } catch (err) {
      logger.errorRequest(req, err as string);
      next(err);
    }
  }

  const authMiddlewareConfig: AuthOptions = {
    chsWebUrl: CHS_URL,
    returnUrl: req.originalUrl
  };

  return authMiddleware(authMiddlewareConfig)(req, res, next);
};
