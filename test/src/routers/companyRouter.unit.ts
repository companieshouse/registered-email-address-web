jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/middleware/authentication.middleware");
jest.mock("../../../src/middleware/session.middleware");

import request from "supertest";
import app from "../../../src/app";
import mocks from "../../mocks/all.middleware.mock";

import { REA_HOME_PAGE, COMPANY_CHANGE_EMAIL_ADDRESS, urlParams } from "../../../src/config/index";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { authenticationMiddleware } from "../../../src/middleware/authentication.middleware";
import { sessionMiddleware } from "../../../src/middleware/session.middleware";
import { ChangeEmailAddressHandler } from "../../../src/routers/handlers/company/changeEmailAddress";
import { createAndLogError } from "../../../src/utils/logger";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req, res, next) => next());

const COMPANY_NUMBER = "1234567";
const TEST_EMAIL = "test@test.co.biz";
const OK_RESPONSE_BODY = {"registered_email_address": `${TEST_EMAIL}`};

const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Registered email address update router test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mocks.mockCompanyAuthenticationMiddleware.mockClear();
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  describe("Registered email address update - router /GET test", () => {
    const mockChangeEmailAddressHandler = ChangeEmailAddressHandler as jest.Mock;
    const mockFunctionHandler = jest.fn();
    const mockCreateAndLogError = createAndLogError as jest.Mock;
    
    mockChangeEmailAddressHandler.mockImplementation(() => {
      get: {
        get: mockFunctionHandler
      }
    });

    const viewData: Object = {
      companyEmailAddress: TEST_EMAIL
    }

    mockFunctionHandler.mockResolvedValueOnce(clone(viewData));
    mockCreateAndLogError.mockReturnValue(new Error());

    const PAGE_HEADING = "What is the new registered email address?";

    it("Should navigate to change email address page", async () => {
      await request(app).get(REA_HOME_PAGE+"/"+COMPANY_CHANGE_EMAIL_ADDRESS).then((response) => {
        expect(response.text).toContain(PAGE_HEADING);
      });
    }, 100000);
  });
});
