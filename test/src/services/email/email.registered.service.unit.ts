import { postRegisteredEmailAddress } from "../../../../src/services/email/email.registered.service";
import { RegisteredEmailAddress } from "@companieshouse/api-sdk-node/dist/services/registered-email-address/types";
import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { createAndLogError } from "../../../../src/utils/common/Logger";
jest.mock("../../../../src/services/api/api.service");
import { validSDKResource } from "../../../mocks/company.profile.mock";
import { StatusCodes } from "http-status-codes";
jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../../src/utils/common/Logger");
import { THERE_IS_A_PROBLEM_ERROR } from "../../../../src/constants/app.const";
import {Session} from "@companieshouse/node-session-handler";
import {Transaction} from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import {postTransaction} from "../../../../src/services/transaction/transaction.service";
import {REFERENCE} from "../../../../src/config";
import {createPublicOAuthApiClient} from "../../../../src/services/api/api.service";
import {validEmailSDKResource} from "../../../mocks/company.email.mock";

let session: any;
// const TRANSACTION_ID = "2222";
// const COMPANY_NUMBER = "12345678";
// const EXPECTED_REF = REFERENCE;

const mockCreatePublicOAuthApiClient = createPublicOAuthApiClient as jest.Mock;
const mockPostTransaction = jest.fn();

mockCreatePublicOAuthApiClient.mockReturnValue({
    registeredEmailAddressService: {
        postRegisteredEmailAddress: mockPostTransaction
    }
});

const clone = (objectToClone: any): any => {
    return JSON.parse(JSON.stringify(objectToClone));
};

describe("Registered Email service test", () => {
  const COMPANY_NUMBER = "1234567";
    const TRANSACTION_ID = "178417-909116-690426";
    const DESCRIPTION = "desc";
    const EMAIL_ADDRESS_TO_REGISTER = "test@test.com";

    beforeEach(() => {
    jest.clearAllMocks();
      session = new Session;
  });

  describe("postRegisteredEmailAddress tests", () => {
      it("Should successfully post a registered email address", async() => {
          // mockGetCompanyProfile.mockResolvedValueOnce(clone(validEmailSDKResource));
          mockPostTransaction.mockResolvedValueOnce({
              httpStatusCode: StatusCodes.CREATED,
              resource: {
                  registeredEmailAddress: EMAIL_ADDRESS_TO_REGISTER
              }
          });

      await postRegisteredEmailAddress(session, TRANSACTION_ID, DESCRIPTION, EMAIL_ADDRESS_TO_REGISTER).then((data) => {
          expect(data.httpStatusCode).toEqual(StatusCodes.CREATED);
          const castedData: Resource<RegisteredEmailAddress> = data as Resource<RegisteredEmailAddress>;
          expect(castedData?.resource?.registeredEmailAddress).toEqual(EMAIL_ADDRESS_TO_REGISTER);
      });

    // it("Should throw an error if no response returned from SDK", async () => {
    //   mockGetCompanyProfile.mockResolvedValueOnce(undefined);
    //
    //   await expect(getCompanyProfile(COMPANY_NUMBER))
    //     .rejects.toBe(undefined)
    //     .catch(() => {
    //       expect(createAndLogError).toHaveBeenCalledWith(THERE_IS_A_PROBLEM_ERROR);
    //       expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining("Company profile API"));
    //       expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
    //     });
    // });
    //
    // it("Should throw an error if SERVICE UNAVAILABLE returned from SDK", async () => {
    //   const HTTP_STATUS_CODE = StatusCodes.SERVICE_UNAVAILABLE;
    //   mockGetCompanyProfile.mockResolvedValueOnce({
    //     httpStatusCode: HTTP_STATUS_CODE
    //   } as Resource<CompanyProfile>);
    //
    //   await expect(getCompanyProfile(COMPANY_NUMBER))
    //     .rejects.toBe(undefined)
    //     .catch(() => {
    //       expect(createAndLogError).toHaveBeenCalledWith(THERE_IS_A_PROBLEM_ERROR);
    //       expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining("Company profile API"));
    //       expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
    //     });
    // });
    //
    // it(`Should throw an error if status code >= ${StatusCodes.BAD_REQUEST}`, async () => {
    //   const HTTP_STATUS_CODE = StatusCodes.BAD_REQUEST;
    //   mockGetCompanyProfile.mockResolvedValueOnce({
    //     httpStatusCode: HTTP_STATUS_CODE
    //   } as Resource<CompanyProfile>);
    //
    //   await expect(getCompanyProfile(COMPANY_NUMBER))
    //     .rejects.toBe(undefined)
    //     .catch(() => {
    //       expect(createAndLogError).toHaveBeenCalledWith(THERE_IS_A_PROBLEM_ERROR);
    //       expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${HTTP_STATUS_CODE}`));
    //       expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
    //     });
    // });
    //
    // it("Should throw an error if no response resource returned from SDK", async () => {
    //   mockGetCompanyProfile.mockResolvedValueOnce({} as Resource<CompanyProfile>);
    //
    //   await expect(getCompanyProfile(COMPANY_NUMBER))
    //     .rejects.toBe(undefined)
    //     .catch(() => {
    //       expect(createAndLogError).toHaveBeenCalledWith(THERE_IS_A_PROBLEM_ERROR);
    //       expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining("no resource"));
    //       expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
    //     });
    });
  });
});
