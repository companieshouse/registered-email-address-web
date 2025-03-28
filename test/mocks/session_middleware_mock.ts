import {validCompanyProfile} from "./company_profile_mock";

jest.mock("ioredis");
jest.mock("../../src/middleware/session_middleware");

import { NextFunction, Request, Response } from "express";
import { createSessionMiddleware, createEnsureSessionCookieSetMiddleware } from "../../src/middleware/session_middleware";
import { Session } from "@companieshouse/node-session-handler";
import {REGISTERED_EMAIL_ADDRESS, COMPANY_NUMBER, RETURN_URL, COMPANY_PROFILE} from "../../src/constants/app_const";

// get handle on mocked function
const mockCreateSessionMiddleware = createSessionMiddleware as jest.Mock;
const mockCreateEnsureSessionCookieSetMiddleware = createEnsureSessionCookieSetMiddleware as jest.Mock;
const mockSessionMiddleware = jest.fn();
const mockEnsureSessionCookieSetMiddleware = jest.fn()

export const session = new Session();
const NUMBER = "1234567";
const EMAIL = "test@test.co.biz";
const URL = "test/return-url";
const PROFILE = validCompanyProfile;

// tell the middleware factory to return a mock
mockCreateSessionMiddleware.mockReturnValue(mockSessionMiddleware);
mockCreateEnsureSessionCookieSetMiddleware.mockReturnValue(mockEnsureSessionCookieSetMiddleware);

// tell the mock what to return
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  req.session = session;
  req.session.data.extra_data[COMPANY_NUMBER] = NUMBER;
  req.session.data.extra_data[REGISTERED_EMAIL_ADDRESS] = EMAIL;
  req.session.data.extra_data[RETURN_URL] = URL;
  req.session.data.extra_data[COMPANY_PROFILE] = PROFILE;
  next();
});

mockEnsureSessionCookieSetMiddleware.mockImplementation((_, __, next) => {
  next();
})

export default mockSessionMiddleware;
