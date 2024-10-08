jest.mock("../../src/middleware/csrf_middleware");

import { NextFunction } from "express";
import { createCsrfProtectionMiddleware } from "../../src/middleware/csrf_middleware";


const mockCreateCsrfProtectionMiddleware = createCsrfProtectionMiddleware as jest.Mock;
const mockCsrfMiddleware = jest.fn();

mockCreateCsrfProtectionMiddleware.mockReturnValue(mockCsrfMiddleware)

mockCsrfMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockCsrfMiddleware;
