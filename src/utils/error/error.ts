import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CsrfError } from "@companieshouse/web-security-node";
import { THERE_IS_A_PROBLEM_URL } from "../../config/index";

const pageNotFoundView: string = "partials/error_404";

export const pageNotFound = (req: Request, res: Response) => {
  return res.status(StatusCodes.NOT_FOUND).render(pageNotFoundView);
};
/**
 * This handler catches any CSRF errors thrown within the application.
 * If it is not a CSRF, the error is passed to the next error handler.
 * If it is a CSRF error, it responds with a 403 forbidden status and renders the CSRF error.
 */

export const csrfErrorHandler = (err: CsrfError | Error, req: Request, res: Response, next: Function) => {
  if (!(err instanceof CsrfError)) {
    return next(err);
  }

  return res.status(403).render(THERE_IS_A_PROBLEM_URL, {
    templateName: THERE_IS_A_PROBLEM_URL,
    csrfErrors: true
  });
};

export default pageNotFound;
