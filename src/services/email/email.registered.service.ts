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

    logger.debug(`Creating Registered Email address Address with company number ${companyNumber}`);
    const sdkResponse: Resource<RegisteredEmailAddress> | ApiErrorResponse = await apiClient.registeredEmailAddressService.postRegisteredEmailAddress(transactionId, registeredEmailAddress);

    if (!sdkResponse) {
        logger.error(`Create Registered Email API POST request returned no response for company number ${companyNumber}`);
        return Promise.reject(sdkResponse);
    }

    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== StatusCodes.CREATED) {
        logger.error(`Http status code ${sdkResponse.httpStatusCode} - Failed to create Registered Email for company number ${companyNumber}`);
        return Promise.reject(sdkResponse);
    }

    const castedSdkResponse: Resource<RegisteredEmailAddress> = sdkResponse as Resource<RegisteredEmailAddress>;

    if (!castedSdkResponse.resource) {
        logger.error(`Create Registered Email API POST request returned no resource for company number ${companyNumber}`);
        return Promise.reject(sdkResponse);
    }

    logger.debug(`Received Create Registered Email  ${JSON.stringify(sdkResponse)}`);

    return Promise.resolve(castedSdkResponse);
};
