import {Session} from "@companieshouse/node-session-handler";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import {createPublicOAuthApiClient} from "../api/api.service";
import {Resource} from "@companieshouse/api-sdk-node";
import {ApiErrorResponse, ApiResponse} from "@companieshouse/api-sdk-node/dist/services/resource";
import {logger} from "../../utils/common/logger";
import {StatusCodes} from "http-status-codes";
import {
  RegisteredEmailAddress,
  RegisteredEmailAddressCreatedResource,
  RegisteredEmailAddressResponse
} from "@companieshouse/api-sdk-node/dist/services/registered-email-address/types";

export const postRegisteredEmailAddress = async (session: Session, transactionId: string, companyNumber: string, registeredEmailAddress: RegisteredEmailAddress): Promise<ApiResponse<RegisteredEmailAddressCreatedResource>> => {
  const apiClient: ApiClient = createPublicOAuthApiClient(session);

  logger.debug(`Creating Registered Email address Address with company number ${companyNumber}`);
  const sdkResponse: ApiResponse<RegisteredEmailAddressResponse> | ApiErrorResponse = await apiClient.registeredEmailAddressService.postRegisteredEmailAddress(transactionId, registeredEmailAddress);

  if (!sdkResponse) {
    logger.error(`Create Registered Email API POST request returned no response for company number ${companyNumber}`);
    return Promise.reject(sdkResponse);
  }

  if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== StatusCodes.CREATED) {
    logger.error(`Http status code ${sdkResponse.httpStatusCode} - Failed to create Registered Email for company number ${companyNumber}`);
    return Promise.reject(sdkResponse);
  }

  const castedSdkResponse: Resource<RegisteredEmailAddressCreatedResource> = sdkResponse as Resource<RegisteredEmailAddressCreatedResource>;

  if (!castedSdkResponse.resource) {
    logger.error(`Create Registered Email API POST request returned no resource for company number ${companyNumber}`);
    return Promise.reject(sdkResponse);
  }

  logger.debug(`Received Create Registered Email  ${JSON.stringify(sdkResponse)}`);

  return Promise.resolve(castedSdkResponse);
};
