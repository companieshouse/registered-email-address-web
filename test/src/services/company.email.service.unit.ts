import { getCompanyEmail } from "../../../src/services/company/company.email.service";
import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { createAndLogError } from "../../../src/utils/logger";
import { emailResource } from "../../mocks/company.email.mock";
import { companyEmail } from "../../../src/services/company/resources/resources";
import { HttpResponse } from "@companieshouse/api-sdk-node/dist/http/http-client";
import { StatusCodes } from 'http-status-codes';

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../src/utils/logger");

const mockCreateApiClient = createApiClient as jest.Mock;
const mockGetCompanyEmail = jest.fn();
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

      Object.getOwnPropertyNames(emailResource.resource).forEach(property => {
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

      Object.getOwnPropertyNames(emailResource.resource).forEach(property => {
        expect(returnedEmail.httpStatusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(returnedEmail.resource).toBeNull;
      });
    });
  });
});
