import { NextFunction, Request, Response } from "express";

const pageNotFoundView: string = "partials/error_404";

export const pageNotFound = (req: Request, res: Response) => {
  return res.status(404).render(pageNotFoundView);
};
