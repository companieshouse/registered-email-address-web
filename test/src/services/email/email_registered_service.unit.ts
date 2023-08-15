import {postRegisteredEmailAddress} from "../../../../src/services/email/email_registered_service";
import {
  RegisteredEmailAddress,
  RegisteredEmailAddressCreatedResource
} from "@companieshouse/api-sdk-node/dist/services/registered-email-address/types";
import {Resource} from "@companieshouse/api-sdk-node";
import {StatusCodes} from "http-status-codes";
import {Session} from "@companieshouse/node-session-handler";
import {createPublicOAuthApiClient} from "../../../../src/services/api/api_service";
import {ApiResponse} from "@companieshouse/api-sdk-node/dist/services/resource";

jest.mock("../../../../src/services/api/api_service");
jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../../src/utils/common/logger");

let session: any;

const mockCreatePublicOAuthApiClient = createPublicOAuthApiClient as jest.Mock;
const mockPostTransaction = jest.fn();

mockCreatePublicOAuthApiClient.mockReturnValue({
  registeredEmailAddressService: {
    postRegisteredEmailAddress: mockPostTransaction
  }
});

describe("Registered Email service test", () => {
  const COMPANY_NUMBER = "1234567";
  const TRANSACTION_ID = "178417-909116-690426";
  const ID = "12345";
  const EMAIL_ADDRESS_TO_REGISTER = "test@test.com";
  const ACCEPT_APPROPRIATE_EMAIL_ADDRESS_STATEMENT = true;
  const mockResponseBody: RegisteredEmailAddress = { registeredEmailAddress: EMAIL_ADDRESS_TO_REGISTER, acceptAppropriateEmailAddressStatement: ACCEPT_APPROPRIATE_EMAIL_ADDRESS_STATEMENT };

  beforeEach(() => {
    jest.clearAllMocks();
    session = new Session;
  });

  describe("postRegisteredEmailAddress tests", () => {
    it("Should successfully post a registered email address", async () => {
      const mockedResponse = {
        httpStatusCode: StatusCodes.CREATED,
        resource: {
          id: ID,
          data: {
            registeredEmailAddress: EMAIL_ADDRESS_TO_REGISTER,
            acceptAppropriateEmailAddressStatement: ACCEPT_APPROPRIATE_EMAIL_ADDRESS_STATEMENT
          }
        }
      };
      mockPostTransaction.mockResolvedValueOnce(mockedResponse as ApiResponse<RegisteredEmailAddressCreatedResource>);

      await postRegisteredEmailAddress(session, TRANSACTION_ID, COMPANY_NUMBER, mockResponseBody).then((data) => {
        expect(data.httpStatusCode).toEqual(StatusCodes.CREATED);
        const castedData: RegisteredEmailAddressCreatedResource = data.resource as RegisteredEmailAddressCreatedResource;
        expect(castedData.id).toEqual(ID);
        expect(castedData.data.registeredEmailAddress).toEqual(EMAIL_ADDRESS_TO_REGISTER);
        expect(castedData.data.acceptAppropriateEmailAddressStatement).toEqual(ACCEPT_APPROPRIATE_EMAIL_ADDRESS_STATEMENT);
      });
    });

    it("Should throw an error when no registered email api response", async () => {
      const mockedResponse = undefined;
      mockPostTransaction.mockResolvedValueOnce(mockedResponse);

      await expect(postRegisteredEmailAddress(session, TRANSACTION_ID, COMPANY_NUMBER, mockResponseBody))
        .rejects.toBe(mockedResponse);
    });

    it("Should throw an error if SERVICE UNAVAILABLE returned from SDK", async () => {
      const mockedResponse = {httpStatusCode: StatusCodes.SERVICE_UNAVAILABLE};
      mockPostTransaction.mockResolvedValueOnce(mockedResponse as Resource<RegisteredEmailAddress>);

      await expect(postRegisteredEmailAddress(session, TRANSACTION_ID, COMPANY_NUMBER, mockResponseBody))
        .rejects.toEqual(mockedResponse);
    });

    it("Should throw an error if no response resource returned from SDK", async () => {
      const mockedResponse = {httpStatusCode: StatusCodes.CREATED};
      mockPostTransaction.mockResolvedValueOnce(mockedResponse);

      await expect(postRegisteredEmailAddress(session, TRANSACTION_ID, COMPANY_NUMBER, mockResponseBody))
        .rejects.toEqual(mockedResponse);
    });
  });
});
