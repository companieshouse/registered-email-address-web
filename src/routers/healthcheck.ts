import { Request, Response, NextFunction } from "express";

const healthcheck = (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send("OK");
};

export default healthcheck;
