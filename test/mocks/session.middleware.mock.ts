import {validCompanyProfile} from "./company.profile.mock";

jest.mock("ioredis");
jest.mock("../../src/middleware/session.middleware");

import { NextFunction, Request, Response } from "express";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import { Session } from "@companieshouse/node-session-handler";
import {REGISTERED_EMAIL_ADDRESS, COMPANY_NUMBER, RETURN_URL, COMPANY_PROFILE} from "../../src/constants/app.const";

// get handle on mocked function
const mockSessionMiddleware = sessionMiddleware as jest.Mock;

export const session = new Session();
const NUMBER = "1234567";
const EMAIL = "test@test.co.biz";
const URL = "test/return-url";
const PROFILE = validCompanyProfile;


// tell the mock what to return
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  req.session = session;
  req.session.data.extra_data[COMPANY_NUMBER] = NUMBER;
  req.session.data.extra_data[REGISTERED_EMAIL_ADDRESS] = EMAIL;
  req.session.data.extra_data[RETURN_URL] = URL;
  req.session.data.extra_data[COMPANY_PROFILE] = PROFILE;
  next();
});

export default mockSessionMiddleware;
