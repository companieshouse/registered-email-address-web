jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../../../src/services/api/api_service");
jest.mock("../../../../../src/utils/common/Logger");

import "reflect-metadata";
import { Request, Response } from "express";
import { createRequest, createResponse, MockRequest, MockResponse } from 'node-mocks-http';
import { InvalidCompanyHandler } from "../../../../../src/routers/handlers/company/invalid_company";
import { Session } from "@companieshouse/node-session-handler";
import { REGISTERED_EMAIL_ADDRESS } from "../../../../../src/constants/app_const";
import { validSDKResource} from "../../../../mocks/company_profile_mock";
import { createAndLogError } from "../../../../../src/utils/common/logger";
import * as constants from "../../../../../src/constants/app_const";
import * as validationConstants from "../../../../../src/constants/validation_const";


// Testing Const
const TEST_EMAIL_EXISTING: string = "test@test.co.biz";
const TEST_COMPANY_NAME:  string = "Test Company";

// default handler instance
let invalidCompanyHandler: InvalidCompanyHandler;

// mocking block - logging
const mockCreateAndLogError = createAndLogError as jest.Mock;
mockCreateAndLogError.mockReturnValue(new Error());

// request/response/session
let session: Session;
let request: MockRequest<Request>;
let response: MockResponse<Response>;

// clone response processor
const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Test ConfirmCompanyHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    invalidCompanyHandler = new InvalidCompanyHandler();
    // session instance
    session = new Session();
    // mock request/responses
    request = createRequest({
      session: session
    });
    response = createResponse();
    //set email in session
    request.session?.setExtraData(REGISTERED_EMAIL_ADDRESS, TEST_EMAIL_EXISTING);
    request.session?.setExtraData(constants.COMPANY_PROFILE, validSDKResource.resource);
  });
  
  it("GET request to serve company Invalid Company - Get invalid company type page", async () => {
    //set Company Profile in session
    request.session?.setExtraData(constants.INVALID_COMPANY_REASON, validationConstants.INVALID_COMPANY_TYPE_REASON);
    await invalidCompanyHandler.get(request, response).then((confirmCompanyResponse) => {
      const invalidCompanyResponseJson = JSON.parse(JSON.stringify(confirmCompanyResponse));
      expect(invalidCompanyResponseJson.pageHeader).toEqual(validationConstants.invalidCompanyTypePage.pageHeader);
      const pageBody = validationConstants.invalidCompanyTypePage.pageBody
        .replace(new RegExp(validationConstants.COMPANY_NAME_PLACEHOLDER, "g"), TEST_COMPANY_NAME);
      expect(invalidCompanyResponseJson.pageBody).toEqual(pageBody);

    });
  });

  it("GET request to serve company Invalid Company - Get invalid company status page", async () => {
    //set Company Profile in session
    request.session?.setExtraData(constants.INVALID_COMPANY_REASON, validationConstants.INVALID_COMPANY_STATUS_REASON);
    await invalidCompanyHandler.get(request, response).then((confirmCompanyResponse) => {
      const invalidCompanyResponseJson = JSON.parse(JSON.stringify(confirmCompanyResponse));
      expect(invalidCompanyResponseJson.pageHeader).toEqual(validationConstants.invalidCompanyStatusPage.pageHeader);
      const pageBody = validationConstants.invalidCompanyStatusPage.pageBody
        .replace(new RegExp(validationConstants.COMPANY_NAME_PLACEHOLDER, "g"), TEST_COMPANY_NAME);
      expect(invalidCompanyResponseJson.pageBody).toEqual(pageBody);

    });
  });

  it("GET request to serve company Invalid Company - Get company has no exisiting registered email page", async () => {
    //set Company Profile in session
    request.session?.setExtraData(constants.INVALID_COMPANY_REASON, validationConstants.INVALID_COMPANY_NO_EMAIL_REASON);
    await invalidCompanyHandler.get(request, response).then((confirmCompanyResponse) => {
      const invalidCompanyResponseJson = JSON.parse(JSON.stringify(confirmCompanyResponse));
      expect(invalidCompanyResponseJson.pageHeader).toEqual(validationConstants.invalidCompanyNoEmailPage.pageHeader);
      const pageBody = validationConstants.invalidCompanyNoEmailPage.pageBody
        .replace(new RegExp(validationConstants.COMPANY_NAME_PLACEHOLDER, "g"), TEST_COMPANY_NAME);
      expect(invalidCompanyResponseJson.pageBody).toEqual(pageBody);
    });
  });

});
    
