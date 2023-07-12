import {
  getCompanyEmail,
  processGetCheckRequest,
  processPostCheckRequest
} from "../../../../src/services/company/company.email.service";
import {createApiClient, Resource} from "@companieshouse/api-sdk-node";
import { createAndLogError } from "../../../../src/lib/Logger";
import { validEmailSDKResource } from "../../../mocks/company.email.mock";
import { companyEmail } from "../../../../src/services/company/resources/resources";
import {HttpResponse} from "@companieshouse/api-sdk-node/dist/http/http-client";
import {StatusCodes} from 'http-status-codes';
import {Request} from "express";
import {COMPANY_NUMBER, SUBMISSION_ID, UPDATED_COMPANY_EMAIL} from "../../../../src/constants/app.const";
import { closeTransaction } from "../../../../src/services/transaction/transaction.service";
import {Session} from "@companieshouse/node-session-handler";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../../src/lib/Logger");

const mockCreateApiClient = createApiClient as jest.Mock;
const mockGetCompanyEmail = jest.fn();
const mockCloseTransaction = jest.fn();
const mockCreateAndLogError = createAndLogError as jest.Mock;

mockCreateApiClient.mockReturnValue({
  apiClient: {
    httpGet: mockGetCompanyEmail
  }
});

mockCreateAndLogError.mockReturnValue(new Error());

const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Company email address service test", () => {
  const COMPANY_NUMBER = "1234567";
  const TEST_EMAIL = "test@test.co.biz";
  const OK_RESPONSE_BODY = {"registered_email_address": `${TEST_EMAIL}`};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCompanyProfile tests", () => {
    it("Should return a company email address", async () => {
      const queryReponse: HttpResponse = {
        status: StatusCodes.OK,
        body: OK_RESPONSE_BODY
      };
      mockGetCompanyEmail.mockResolvedValueOnce(clone(queryReponse));
      const returnedEmail: Resource<companyEmail> = await getCompanyEmail(COMPANY_NUMBER);

      Object.getOwnPropertyNames(validEmailSDKResource.resource).forEach(property => {
        expect(returnedEmail.httpStatusCode).toEqual(StatusCodes.OK);
        expect(returnedEmail.resource).toHaveProperty(property);
        expect(returnedEmail.resource?.companyEmail).toEqual(TEST_EMAIL);
      });
    });

    it("Should return the received error code if response status >= 400", async () => {
      const queryReponse: HttpResponse = {
        status: StatusCodes.BAD_REQUEST
      };
      mockGetCompanyEmail.mockResolvedValueOnce(clone(queryReponse));

      const returnedEmail: Resource<companyEmail> = await getCompanyEmail(COMPANY_NUMBER);

      Object.getOwnPropertyNames(validEmailSDKResource.resource).forEach(property => {
        expect(returnedEmail.httpStatusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(returnedEmail.resource).toBeNull;
      });
    });
  });

  describe("Check your answer request processing", () => {
    test("Should return the updated email address", async () => {
      const mockRequest = {} as Request;
      const session = new Session();
      mockRequest.session = session;
      session.setExtraData(UPDATED_COMPANY_EMAIL, "test@test.com");

      const result = await processGetCheckRequest(mockRequest)
        .then(function (result) {
          return result;
        });

      expect(result).toMatchObject({"updatedCompanyEmail": "test@test.com"});
      expect(result).toMatchObject({backUri: "/registered-email-address/email/change-email-address"});
    });

    test("Should accept when updated email address is confirmed", async () => {
      const mockRequest = {
        body: {
          emailConfirmation: 'anyvalue',
        },
      } as Request;

      mockCloseTransaction.mockImplementation(() => {
        throw createAndLogError("anything");
      });

      const session = new Session();
      mockRequest.session = session;
      session.setExtraData("companyNumber", COMPANY_NUMBER);

      const result = await processPostCheckRequest(mockRequest)
        .then(function (result) {
          return result;
        });

      expect(result).toMatchObject({errors: "Unable to close a transaction record for company " + COMPANY_NUMBER});
    });

    test("Should reject when updated email address is not confirmed", async () => {
      const mockRequest = {
        body: {},
      } as Request;
      const session = new Session();
      mockRequest.session = session;
      session.setExtraData(UPDATED_COMPANY_EMAIL, "test@test.com");

      const result = await processPostCheckRequest(mockRequest)
        .then(function (result) {
          return result;
        });

      expect(result).toMatchObject({statementError: "You need to accept the registered email address statement"});
      expect(result).toMatchObject({updatedCompanyEmail: "test@test.com"});
      expect(result).toMatchObject({backUri: "/registered-email-address/email/change-email-address"});
    });
  });
});

