jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../../../src/services/api/api.service");
jest.mock("../../../../../src/services/api/private-get-rea");
jest.mock("../../../../../src/utils/common/Logger");

import "reflect-metadata";
import { Request, Response } from "express";
import { createRequest, createResponse, MockRequest, MockResponse } from 'node-mocks-http';
import { ConfirmCompanyHandler } from "../../../../../src/routers/handlers/company/confirm";
import { Session } from "@companieshouse/node-session-handler";
import { REGISTERED_EMAIL_ADDRESS } from "../../../../../src/constants/app.const";
import {createApiClient} from "@companieshouse/api-sdk-node";
import { createPrivateApiClient } from "../../../../../src/services/api/private-get-rea";
import { CompanyProfileErrorResponse, validSDKResource} from "../../../../mocks/company.profile.mock";
import { validEmailSDKResource, EmailErrorReponse, EmailNotFoundReponse} from "../../../../mocks/company.email.mock";
import { createAndLogError } from "../../../../../src/utils/common/Logger";
import * as constants from "../../../../../src/constants/app.const";
import * as validationConstants from "../../../../../src/constants/validation.const";


// Testing Const
const TEST_EMAIL_EXISTING: string = "test@test.co.biz";

// default handler instance
let confirmCompanyHandler: ConfirmCompanyHandler;

// mocking block - company profile
const mockGetCompanyProfile = jest.fn();

// mocking block - company email
const mockGetCompanyEmail = jest.fn();

// mocking block - ApiClient
const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue({
  companyProfile: {
    getCompanyProfile: mockGetCompanyProfile
  }
});

// mocking block - PrivateApiClient
const mockCreatePrivateApiClient = createPrivateApiClient as jest.Mock;
mockCreatePrivateApiClient.mockReturnValue({
  registeredEmailAddress: {
    getCompanyEmail: mockGetCompanyEmail
  }
});

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
    confirmCompanyHandler = new ConfirmCompanyHandler();
    // session instance
    session = new Session();
    // mock request/responses
    request = createRequest({
      session: session
    });
    response = createResponse();
    //set email in session
    request.session?.setExtraData(REGISTERED_EMAIL_ADDRESS, TEST_EMAIL_EXISTING);
  });
  

  it("Get Request in ConfirmCompanyHandlerr - Get Confirm Company Screen Successful", async () => {
    //set Company Profile in session
    request.session?.setExtraData(constants.COMPANY_PROFILE, validSDKResource.resource);
    await confirmCompanyHandler.get(request, response).then((confirmCompanyResponse) => {
      const confirmCompanyResponseJson = JSON.parse(JSON.stringify(confirmCompanyResponse));
      expect(confirmCompanyResponseJson.company.companyName).toEqual('Test Company');
      expect(confirmCompanyResponseJson.company.companyNumber).toEqual('12345678');
      expect(confirmCompanyResponseJson.company.companyStatus).toEqual('Active');
      expect(confirmCompanyResponseJson.company.type).toEqual('Private limited company');
      expect(confirmCompanyResponseJson.company.registeredOfficeAddress).toBeTruthy();
      expect(confirmCompanyResponseJson.backUri).toEqual('/registered-email-address/company/number');
    });
  });

  it("Get Request in ConfirmCompanyHandler - Get Confirm Company Screen Successful via a request backlink", async () => {
    // Mock Company Profile Request
    mockGetCompanyProfile.mockResolvedValueOnce(clone(validSDKResource));

    //Set Company Number in Query
    request.query = {companyNumber : '12345678'};
  
    await confirmCompanyHandler.get(request, response).then((confirmCompanyResponse) => {
      const confirmCompanyResponseJson = JSON.parse(JSON.stringify(confirmCompanyResponse));
      expect(confirmCompanyResponseJson.company.companyName).toEqual('Test Company');
      expect(confirmCompanyResponseJson.company.companyNumber).toEqual('12345678');
      expect(confirmCompanyResponseJson.company.companyStatus).toEqual('Active');
      expect(confirmCompanyResponseJson.company.type).toEqual('Private limited company');
      expect(confirmCompanyResponseJson.company.registeredOfficeAddress).toBeTruthy();
      expect(confirmCompanyResponseJson.backUri).toEqual('/registered-email-address/company/number');
    });
  });

  it("Get Request in ConfirmCompanyHandler - Confirm Company Screen Unsuccessful via a request backlink", async () => {
    // Mock Company Profile Request
    mockGetCompanyProfile.mockResolvedValueOnce(clone(CompanyProfileErrorResponse));

    //Set Company Number in Query
    request.query = {companyNumber : '12345678'};

    await confirmCompanyHandler.get(request, response).then((confirmCompanyResponse) => {
      const confirmCompanyResponseJson = JSON.parse(JSON.stringify(confirmCompanyResponse));
      expect(confirmCompanyResponseJson.errors.companyNumber).toEqual('You must enter a valid company number');
    });
  });

  it("POST Request in ConfirmCompanyHandler - Company is Valid add email to Session Extra Data", async () => {
    mockGetCompanyEmail.mockResolvedValueOnce(clone(validEmailSDKResource));

    //set Company Profile and number in session
    request.session?.setExtraData(constants.COMPANY_PROFILE, validSDKResource.resource);
    request.session?.setExtraData(constants.COMPANY_NUMBER, validSDKResource.resource?.companyNumber);

    await confirmCompanyHandler.post(request, response).then(() => {
      expect(request.session?.getExtraData(constants.REGISTERED_EMAIL_ADDRESS)).toBeTruthy;
      expect(request.session?.getExtraData(constants.REGISTERED_EMAIL_ADDRESS)).toEqual(TEST_EMAIL_EXISTING);
    });
  });

  it("POST Request in ConfirmCompanyHandler - Company has invalid company type", async () => {
    //set Company Profile in session    
    const invalidCompany = {type : "invalid-company-type"};
    request.session?.setExtraData(constants.COMPANY_PROFILE, invalidCompany);

    await confirmCompanyHandler.post(request, response).catch((confirmCompanyResponse) => {
      const confirmCompanyResponseJson = JSON.parse(JSON.stringify(confirmCompanyResponse));
      expect(confirmCompanyResponseJson.invalidCompanyReason).toEqual(validationConstants.INVALID_COMPANY_TYPE_REASON);
    });
  });

  it("POST Request in ConfirmCompanyHandler - Company has invalid company status", async () => {
    //set Company Profile in session    
    const invalidCompany = {
      type : "ltd",
      companyStatus : "invalid-company-staus"};
    request.session?.setExtraData(constants.COMPANY_PROFILE, invalidCompany);

    await confirmCompanyHandler.post(request, response).catch((confirmCompanyResponse) => {
      const confirmCompanyResponseJson = JSON.parse(JSON.stringify(confirmCompanyResponse));
      expect(confirmCompanyResponseJson.invalidCompanyReason).toEqual(validationConstants.INVALID_COMPANY_STATUS_REASON);
    });
  });

  it("POST Request in ConfirmCompanyHandler - Company has no registered email addres", async () => {
    //mock the email response
    mockGetCompanyEmail.mockRejectedValueOnce(clone(EmailNotFoundReponse));

    //set Company Profile in session    
    const invalidCompany = {
      type : "ltd",
      companyStatus : "active",
      companyNumber : "12345678"
    };
    request.session?.setExtraData(constants.COMPANY_PROFILE, invalidCompany);
    request.session?.setExtraData(constants.COMPANY_NUMBER, validSDKResource.resource?.companyNumber);

    await confirmCompanyHandler.post(request, response)
      .then((confirmCompanyResponse) => {
        const confirmCompanyResponseJson = JSON.parse(JSON.stringify(confirmCompanyResponse));
        expect(confirmCompanyResponseJson.invalidCompanyReason).toEqual(validationConstants.INVALID_COMPANY_SERVICE_UNAVAILABLE);
      })
      .catch((e) => {
        expect(e).toEqual(validationConstants.INVALID_COMPANY_SERVICE_UNAVAILABLE);
      });
  });

});
    
