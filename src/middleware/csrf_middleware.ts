import { NextFunction, Request, Response } from "express";
import { CsrfError, CsrfProtectionMiddleware } from "@companieshouse/web-security-node";
import { SessionStore } from "@companieshouse/node-session-handler";
import { COOKIE_NAME } from "../config";
import { StatusCodes } from "http-status-codes";

const csrfErrorTemplateName = "partials/error_403";

export const csrfErrorHandler = (
  err: CsrfError | Error,
  _: Request,
  res: Response,
  next: NextFunction
) => {
  if (!(err instanceof CsrfError)) {
    return next(err);
  }

  return res.status(StatusCodes.FORBIDDEN).render(csrfErrorTemplateName, {
    csrfErrors: true,
  });
};

export const createCsrfProtectionMiddleware = (sessionStore: SessionStore) => 
  CsrfProtectionMiddleware({
    // @ts-expect-error  Looks like there is a minor version disparity somewhere along but nothing too significant
    sessionStore: sessionStore,
    enabled: true,
    sessionCookieName: COOKIE_NAME
  });
