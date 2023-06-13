import { NextFunction, Request, Response } from "express";

export const serviceAvailabilityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  return next();
};
