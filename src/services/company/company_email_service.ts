import { Resource } from "@companieshouse/api-sdk-node";
import { createPrivateApiClient } from "../api/private-get-rea";
import {CHS_API_KEY, CHS_INTERNAL_API_KEY, ORACLE_QUERY_API_URL} from "../../config";
import { logger } from "../../utils/common/logger";
import { StatusCodes } from 'http-status-codes';
import {RegisteredEmailAddress} from "@companieshouse/api-sdk-node/dist/services/registered-email-address/types";

/**
* Get the registered email address for a company - private API
*
* @param companyNumber the company number to look up
*/
export const getCompanyEmail = async (companyNumber: string): Promise<Resource<RegisteredEmailAddress>> => {
  const privateApiClient = createPrivateApiClient(CHS_INTERNAL_API_KEY, undefined, ORACLE_QUERY_API_URL );

  logger.debug(`Looking for registered email address with company number ${companyNumber}`);
  const sdkResponse: Resource<RegisteredEmailAddress> = await privateApiClient.registeredEmailAddress.getRegisteredEmailAddress(companyNumber);

  if (!sdkResponse) {
    logger.error( `Registered email address API for company number ${companyNumber}`);
    return Promise.reject(sdkResponse);
  }

  if (sdkResponse.httpStatusCode !== StatusCodes.OK) {
    logger.error( `Http status code ${sdkResponse.httpStatusCode} - Failed to get registered email address for company number ${companyNumber}`);
    return Promise.reject(sdkResponse);
  }

  if (!sdkResponse.resource) {
    logger.error( `Registered email address API returned no resource for company number ${companyNumber}`);
    return Promise.reject(sdkResponse);
  }

  logger.debug(`Received registered email address ${JSON.stringify(sdkResponse)}`);

  return Promise.resolve(sdkResponse);
};

