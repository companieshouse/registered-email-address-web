import { NextFunction, Request, Response } from "express";
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { CHS_URL, PLACEHOLDER_URL } from "../config/index";

export const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authMiddlewareConfig: AuthOptions = {
    chsWebUrl: CHS_URL,
    returnUrl: PLACEHOLDER_URL
  };

  return authMiddleware(authMiddlewareConfig)(req, res, next);
};
