jest.mock("../../src/middleware/csrf_protection_middleware");

import { NextFunction, Request, Response } from "express";
import { csrf_protection_middleware } from "../../src/middleware/csrf_protection_middleware";

// get handle on mocked function
const mockCsrfProtectionMiddleware = csrf_protection_middleware as jest.Mock;

// tell the mock what to return
mockCsrfProtectionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockCsrfProtectionMiddleware;
