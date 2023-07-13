import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { CHS_API_KEY } from "../../config/index";
import { logger, createAndLogError } from "../../lib/Logger";
import { SOMETHING_HAS_GONE_WRONG, SERVICE_UNAVAILABLE } from "../../constants/app.const";
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
    throw createAndLogError( SERVICE_UNAVAILABLE, `Company profile API for company number ${companyNumber}`);
  }

  if (sdkResponse.httpStatusCode === StatusCodes.SERVICE_UNAVAILABLE || sdkResponse.httpStatusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
    throw createAndLogError( SERVICE_UNAVAILABLE, `Company profile API for company number ${companyNumber}`);
  } else if (sdkResponse.httpStatusCode >= StatusCodes.BAD_REQUEST) {
    throw createAndLogError( SOMETHING_HAS_GONE_WRONG, `Http status code ${sdkResponse.httpStatusCode} - Failed to get company profile for company number ${companyNumber}`);
  }

  if (!sdkResponse.resource) {
    throw createAndLogError( SOMETHING_HAS_GONE_WRONG, `Company profile API returned no resource for company number ${companyNumber}`);
  }

  logger.debug(`Received company profile ${JSON.stringify(sdkResponse)}`);

  return sdkResponse.resource;
};
