import {Session} from "@companieshouse/node-session-handler";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import {createPublicOAuthApiClient} from "../api/api.service";
import {Resource} from "@companieshouse/api-sdk-node";
import {ApiErrorResponse} from "@companieshouse/api-sdk-node/dist/services/resource";
import {logger} from "../../utils/common/Logger";
import {StatusCodes} from "http-status-codes";
import {RegisteredEmailAddress} from "@companieshouse/api-sdk-node/dist/services/registered-email-address/types";

export const postRegisteredEmailAddress = async (session: Session, transactionId: string, companyNumber: string, companyEmail: string): Promise<Awaited<Resource<RegisteredEmailAddress> | ApiErrorResponse>> => {
  const apiClient: ApiClient = createPublicOAuthApiClient(session);
  const registeredEmailAddress: RegisteredEmailAddress = {registeredEmailAddress: companyEmail};

  logger.debug(`Creating registered email address Address with company number ${companyNumber}`);
  const sdkResponse: Resource<RegisteredEmailAddress> | ApiErrorResponse = await apiClient.registeredEmailAddressService.postRegisteredEmailAddress(transactionId, registeredEmailAddress);

  if (!sdkResponse) {
    logger.error(`Create registered email API POST request returned no response for company number ${companyNumber}`);
    return Promise.reject(sdkResponse);
  }

  if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== StatusCodes.CREATED) {
    logger.error(`Http status code ${sdkResponse.httpStatusCode} - Failed to Create Registered Email for company number ${companyNumber}`);
    return Promise.reject(sdkResponse);
  }

  const castedSdkResponse: Resource<RegisteredEmailAddress> = sdkResponse as Resource<RegisteredEmailAddress>;

  if (!castedSdkResponse.resource) {
    logger.error(`Create registered email API POST request returned no resource for company number ${companyNumber}`);
    return Promise.reject(sdkResponse);
  }

  logger.debug(`Received Create Registered Email  ${JSON.stringify(sdkResponse)}`);

  return Promise.resolve(castedSdkResponse);


  // return Promise.resolve("for gods sake");
  // return Promise.resolve(sdkResponse);

  // const apiResponse: HttpResponse = await apiClient.apiClient.httpPost(`/transactions/${transactionId}/registered-email-address`, {registered_email_address: companyEmail});
  // if (apiResponse.status === StatusCodes.CREATED) {
  //   logger.info(`Successfully created registered-email-resource for transaction: ${transactionId}, email: ${companyEmail}`);
  //   return Promise.resolve(apiResponse);
  // } else {
  //   logger.error(`Failed to create registered-email-resource for transaction: ${transactionId}, status: ${apiResponse.status}`);
  //   return Promise.reject(FAILED_TO_CREATE_REA_ERROR);
  // }
};
