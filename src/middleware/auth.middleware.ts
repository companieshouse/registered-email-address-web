import { AuthOptions } from "@companieshouse/web-security-node";
import { NextFunction, Request, RequestHandler, Response } from "express";

import { COMPANY_NUMBER_URL } from "../config/index";
import UriFactory from "../utils/middleware/uri.factory";

const USER_AUTH_WHITELISTED_URLS: string[] = [
  COMPANY_NUMBER_URL,
  `${COMPANY_NUMBER_URL}/`
];

export default function AuthMiddleware (
  accountWebUrl: string, uriFactory: UriFactory, commonAuthMiddleware: (opts: AuthOptions) => RequestHandler
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (isWhitelistedUrl(req.url)) {
      return next();
    }

    const authOptions: AuthOptions = {
      returnUrl: uriFactory.createAbsoluteUri(req, COMPANY_NUMBER_URL),
      chsWebUrl: accountWebUrl
    };

    return commonAuthMiddleware(authOptions)(req, res, next);
  };
}

function isWhitelistedUrl (url: string): boolean {
  return USER_AUTH_WHITELISTED_URLS.includes(url);
}
