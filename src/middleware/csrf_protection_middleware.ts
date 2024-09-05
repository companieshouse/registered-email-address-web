import { NextFunction, Request, Response } from "express";
import { CsrfProtectionMiddleware, CsrfOptions } from "@companieshouse/web-security-node";
import { SessionStore } from "@companieshouse/node-session-handler";
import Redis from "ioredis";
import { CACHE_SERVER } from "../config";

const redis = new Redis(CACHE_SERVER);

export const csrf_protection_middleware = (req: Request, res: Response, next: NextFunction) => {
  const csrfMiddlewareConfig: CsrfOptions = {
    enabled: true,
    sessionStore: new SessionStore(redis),
  };

  return CsrfProtectionMiddleware(csrfMiddlewareConfig)(req, res, next);
};
