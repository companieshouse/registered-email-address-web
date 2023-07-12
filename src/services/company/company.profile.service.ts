import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { CHS_API_KEY } from "../../config/index";
import { logger, createAndLogError, createAndLogServiceUnavailable } from "../../lib/Logger";
import { StatusCodes } from 'http-status-codes';

/**
* Get the profile for a company.
*
* @param companyNumber the company number to look up
*/
export const getCompanyProfile = async (companyNumber: string): Promise<CompanyProfile> => {
  const apiClient = createApiClient(CHS_API_KEY);

  logger.debug(`Looking for company profile with company number ${companyNumber}`);
  const sdkResponse: Resource<CompanyProfile> = await apiClient.companyProfile.getCompanyProfile(companyNumber);

  if (!sdkResponse) {
    throw createAndLogServiceUnavailable(`Company profile API for company number ${companyNumber}`);
  }

  if (sdkResponse.httpStatusCode === StatusCodes.SERVICE_UNAVAILABLE) {
    throw createAndLogServiceUnavailable(`Company profile API for company number ${companyNumber}`);
  } else if (sdkResponse.httpStatusCode >= StatusCodes.BAD_REQUEST) {
    throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to get company profile for company number ${companyNumber}`);
  }

  if (!sdkResponse.resource) {
    throw createAndLogError(`Company profile API returned no resource for company number ${companyNumber}`);
  }

  logger.debug(`Received company profile ${JSON.stringify(sdkResponse)}`);

  return sdkResponse.resource;
};
