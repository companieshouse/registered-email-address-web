jest.mock("../../src/middleware/authentication_middleware");

import { NextFunction, Request, Response } from "express";
import { authentication_middleware } from "../../src/middleware/authentication_middleware";

// get handle on mocked function
const mockAuthenticationMiddleware = authentication_middleware as jest.Mock;

// tell the mock what to return
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockAuthenticationMiddleware;
