jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../../src/services/api/private-get-rea");
jest.mock("../../../../src/utils/common/Logger");

import { getCompanyEmail } from "../../../../src/services/company/company.email.service";
import { RegisteredEmailAddress, createPrivateApiClient } from "../../../../src/services/api/private-get-rea";
import { Resource } from "@companieshouse/api-sdk-node";
import { createAndLogError  } from "../../../../src/utils/common/Logger";
import { validEmailSDKResource } from "../../../mocks/company.email.mock";
import { StatusCodes } from 'http-status-codes';
import { THERE_IS_A_PROBLEM_ERROR } from "../../../../src/constants/app.const";

const mockCreatePrivateApiClient = createPrivateApiClient as jest.Mock;
const mockGetRegisteredEmailAddress = jest.fn();

mockCreatePrivateApiClient.mockReturnValue({
  registeredEmailAddress: {
    getRegisteredEmailAddress: mockGetRegisteredEmailAddress
  }
});

const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Company email address service test", () => {
  const COMPANY_NUMBER = "1234567";
  const TEST_EMAIL = "test@test.co.biz";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCompanyEmail tests", () => {
    it("Should return a company email address", async () => {
      mockGetRegisteredEmailAddress.mockResolvedValueOnce(clone(validEmailSDKResource));
      const returnedEmail: Resource<RegisteredEmailAddress> = await getCompanyEmail(COMPANY_NUMBER);

      expect(returnedEmail?.resource?.registeredEmailAddress).toEqual(TEST_EMAIL);
    });

    it("Should throw an error if no response returned from SDK", async () => {
      mockGetRegisteredEmailAddress.mockResolvedValueOnce(undefined);

      await expect(getCompanyEmail(COMPANY_NUMBER))
        .rejects.toBe(undefined);
    });

    it (`Should throw an error if NOT FOUND returned from SDK`, async () => {
      const HTTP_STATUS_CODE = StatusCodes.NOT_FOUND;
      mockGetRegisteredEmailAddress.mockResolvedValueOnce({
        httpStatusCode: HTTP_STATUS_CODE
      } as Resource<RegisteredEmailAddress>);

      await expect(getCompanyEmail(COMPANY_NUMBER))
        .rejects.toEqual({httpStatusCode: StatusCodes.NOT_FOUND});
    });

    it (`Should return the received error code if response status >= ${StatusCodes.BAD_REQUEST}`, async () => {
      const HTTP_STATUS_CODE = StatusCodes.BAD_REQUEST;
      mockGetRegisteredEmailAddress.mockResolvedValueOnce({
        httpStatusCode: HTTP_STATUS_CODE
      } as Resource<RegisteredEmailAddress>);

      await expect(getCompanyEmail(COMPANY_NUMBER))
        .rejects.toEqual({httpStatusCode: StatusCodes.BAD_REQUEST});
    });

    it("Should throw an error if no response resource returned from SDK", async () => {
      console.log("Should throw an error if no response resource returned from SDK");
      mockGetRegisteredEmailAddress.mockResolvedValueOnce({} as Resource<RegisteredEmailAddress>);

      await expect(getCompanyEmail(COMPANY_NUMBER))
        .rejects.toEqual({});
    });
  });
});
