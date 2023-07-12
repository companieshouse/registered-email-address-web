import { Resource } from "@companieshouse/api-sdk-node";
import { createPrivateApiClient, RegisteredEmailAddress } from "../api/private-get-rea";
import { CHS_API_KEY, ORACLE_QUERY_API_URL } from "../../config";
import { logger, createAndLogError, createAndLogServiceUnavailable } from "../../lib/Logger";
import { StatusCodes } from 'http-status-codes';

/**
* Get the registered email address for a company - private API
*
* @param companyNumber the company number to look up
*/
export const getCompanyEmail = async (companyNumber: string): Promise<RegisteredEmailAddress> => {
  const privateApiClient = createPrivateApiClient(CHS_API_KEY, undefined, ORACLE_QUERY_API_URL );

  logger.debug(`Looking for registered email address with company number ${companyNumber}`);
  const sdkResponse: Resource<RegisteredEmailAddress> = await privateApiClient.registeredEmailAddress.getRegisteredEmailAddress(companyNumber);

  if (!sdkResponse) {
    throw createAndLogServiceUnavailable(`Registered email address API for company number ${companyNumber}`);
  }

  if (sdkResponse.httpStatusCode === StatusCodes.SERVICE_UNAVAILABLE) {
    throw createAndLogServiceUnavailable(`Registered email address API for company number ${companyNumber}`);
  } else if (sdkResponse.httpStatusCode >= StatusCodes.BAD_REQUEST) {
    throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to get registered email address for company number ${companyNumber}`);
  }

  if (!sdkResponse.resource) {
    throw createAndLogError(`Registered email address API returned no resource for company number ${companyNumber}`);
  }

  logger.debug(`Received registered email address ${JSON.stringify(sdkResponse)}`);

  return sdkResponse.resource;
};
