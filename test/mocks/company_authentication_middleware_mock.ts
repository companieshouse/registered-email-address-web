jest.mock("../../src/middleware/company_authentication_middleware");

import { NextFunction, Request, Response } from "express";
import { company_authentication_middleware } from "../../src/middleware/company_authentication_middleware";

// get handle on mocked function
const mockCompanyAuthenticationMiddleware = company_authentication_middleware as jest.Mock;

// tell the mock what to return
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockCompanyAuthenticationMiddleware;
