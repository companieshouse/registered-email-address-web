jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../../src/services/api/api.service");
jest.mock("../../../../src/lib/Logger");

import "reflect-metadata";
import FormValidator from "../../../../src/utils/formValidator.util";
import CompanyNumberSanitizer from "../../../../src/utils/companyNumberSanitizer";
import { Request, Response } from "express";
import { createRequest, createResponse, MockRequest, MockResponse } from 'node-mocks-http';
import { CompanySearchHandler } from "../../../../src/routers/handlers/company/companySearch";
import { Session } from "@companieshouse/node-session-handler";
import { COMPANY_EMAIL } from "../../../../src/constants/app.const";
import {createApiClient} from "@companieshouse/api-sdk-node";
import { validSDKResource, CompanyProfileErrorResponse} from "../../../mocks/company.profile.mock";
import { createAndLogError } from "../../../../src/lib/Logger";

// Testing Const
const TEST_EMAIL_EXISTING: string = "test@test.co.biz";

// create form validator instance
const formValidator = new FormValidator();

// create Company Number Sanitizer Instance
const companyNumberSanitizer = new CompanyNumberSanitizer();

// default handler instance
let companySearchHandler: CompanySearchHandler;

// mocking block - company profile
const mockGetCompanyProfile = jest.fn();

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue({
  companyProfile: {
    getCompanyProfile: mockGetCompanyProfile
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

describe("Request to enter company number - test GET method", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    companySearchHandler = new CompanySearchHandler(formValidator, companyNumberSanitizer);
    // session instance
    session = new Session();
    // mock request/responses
    request = createRequest({
      session: session
    });
    response = createResponse();
    //set email in session
    request.session?.setExtraData(COMPANY_EMAIL, TEST_EMAIL_EXISTING);
  });
  

  it("Request to enter company number - request for company profile successful", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(clone(validSDKResource));
    //set email in session
    request._setBody({companyNumber :  '12345678'});
    await companySearchHandler.post(request, response).then((searchCompanyNumbersResponse) => {
      const searchCompanyNumbersResponseJson = JSON.parse(JSON.stringify(searchCompanyNumbersResponse));
      expect(searchCompanyNumbersResponseJson.companyName).toEqual('Test Company');
      expect(searchCompanyNumbersResponseJson.companyStatusDetail).toEqual('company status detail');
      expect(searchCompanyNumbersResponseJson.companyStatus).toEqual('active');

    });
  });

  it("Request to enter company number - request for company profile Error", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(clone(CompanyProfileErrorResponse));
    request._setBody({companyNumber :  '12345678'});
    await companySearchHandler.post(request, response).then((searchCompanyNumbersResponse) => {
      const searchCompanyNumbersResponseJson = JSON.parse(JSON.stringify(searchCompanyNumbersResponse));
      expect(searchCompanyNumbersResponseJson.backUri).toEqual('/registered-email-address');
      expect(searchCompanyNumbersResponseJson.signoutBanner).toEqual(true);
      expect(searchCompanyNumbersResponseJson.errors.companyNumber).toEqual('You must enter a valid company number');
    });
  });

});
    
