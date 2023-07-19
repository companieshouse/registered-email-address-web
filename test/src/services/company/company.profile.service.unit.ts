import { getCompanyProfile } from "../../../../src/services/company/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { createAndLogError } from "../../../../src/utils/common/Logger";
import { validSDKResource } from "../../../mocks/company.profile.mock";
import { StatusCodes } from "http-status-codes";
jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../../src/utils/common/Logger");
import { THERE_IS_A_PROBLEM } from "../../../../src/constants/app.const";

const mockCreateApiClient = createApiClient as jest.Mock;
const mockGetCompanyProfile = jest.fn();

mockCreateApiClient.mockReturnValue({
  companyProfile: {
    getCompanyProfile: mockGetCompanyProfile
  }
});


const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Company profile service test", () => {
  const COMPANY_NUMBER = "1234567";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCompanyProfile tests", () => {
    it("Should return a company profile", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(clone(validSDKResource));
      const returnedProfile: CompanyProfile = await getCompanyProfile(COMPANY_NUMBER);

      Object.getOwnPropertyNames(validSDKResource.resource).forEach(property => {
        expect(returnedProfile).toHaveProperty(property);
      });
    });

    it("Should throw an error if no response returned from SDK", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(undefined);

      await expect(getCompanyProfile(COMPANY_NUMBER))
        .rejects.toBe(undefined)
        .catch(() => {
          expect(createAndLogError).toHaveBeenCalledWith(THERE_IS_A_PROBLEM);
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining("Company profile API"));
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
        });
    });

    it("Should throw an error if SERVICE UNAVAILABLE returned from SDK", async () => {
      const HTTP_STATUS_CODE = StatusCodes.SERVICE_UNAVAILABLE;
      mockGetCompanyProfile.mockResolvedValueOnce({
        httpStatusCode: HTTP_STATUS_CODE
      } as Resource<CompanyProfile>);

      await expect(getCompanyProfile(COMPANY_NUMBER))
        .rejects.toBe(undefined)
        .catch(() => {
          expect(createAndLogError).toHaveBeenCalledWith(THERE_IS_A_PROBLEM);
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining("Company profile API"));
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
        });
    });

    it(`Should throw an error if status code >= ${StatusCodes.BAD_REQUEST}`, async () => {
      const HTTP_STATUS_CODE = StatusCodes.BAD_REQUEST;
      mockGetCompanyProfile.mockResolvedValueOnce({
        httpStatusCode: HTTP_STATUS_CODE
      } as Resource<CompanyProfile>);

      await expect(getCompanyProfile(COMPANY_NUMBER))
        .rejects.toBe(undefined)
        .catch(() => {
          expect(createAndLogError).toHaveBeenCalledWith(THERE_IS_A_PROBLEM);
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${HTTP_STATUS_CODE}`));
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
        });
    });

    it("Should throw an error if no response resource returned from SDK", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce({} as Resource<CompanyProfile>);

      await expect(getCompanyProfile(COMPANY_NUMBER))
        .rejects.toBe(undefined)
        .catch(() => {
          expect(createAndLogError).toHaveBeenCalledWith(THERE_IS_A_PROBLEM);
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining("no resource"));
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
        });
    });
  });
});
