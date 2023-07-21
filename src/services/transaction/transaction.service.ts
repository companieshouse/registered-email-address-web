import { Resource } from "@companieshouse/api-sdk-node";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import {createAndLogError, logger} from "../../utils/common/Logger";
import { SOMETHING_HAS_GONE_WRONG, SERVICE_UNAVAILABLE } from "../../constants/app.const";
import {createPublicOAuthApiClient} from "../api/api.service";
import {Session} from "@companieshouse/node-session-handler";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { ApiErrorResponse, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

import {DESCRIPTION, REFERENCE, transactionStatuses} from "../../config";
import {DateTime} from "luxon";

/**
 * Post transaction
 */
export const postTransaction = async (session: Session, companyNumber: string, description: string, reference: string): Promise<Transaction> => {
    const apiClient: ApiClient = createPublicOAuthApiClient(session);

    const transaction: Transaction = {
        companyNumber,
        reference,
        description,
    };

    logger.debug(`Creating transaction with company number ${companyNumber}`);
    const sdkResponse: Resource<Transaction> | ApiErrorResponse = await apiClient.transaction.postTransaction(transaction);

    if (!sdkResponse) {
        throw createAndLogError(SERVICE_UNAVAILABLE, `Transaction API POST request returned no response for company number ${companyNumber}`);
    }

    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= 400) {
        throw createAndLogError(SOMETHING_HAS_GONE_WRONG, `Http status code ${sdkResponse.httpStatusCode} - Failed to post transaction for company number ${companyNumber}`);
    }

    const castedSdkResponse: Resource<Transaction> = sdkResponse as Resource<Transaction>;

    if (!castedSdkResponse.resource) {
        throw createAndLogError(SOMETHING_HAS_GONE_WRONG, `Transaction API POST request returned no resource for company number ${companyNumber}`);
    }

    logger.debug(`Received transaction ${JSON.stringify(sdkResponse)}`);

    return castedSdkResponse.resource;
};

/**
 * Close transaction
 */
export const closeTransaction = async (session: Session, companyNumber: string, transactionId: string): Promise<ApiResponse<Transaction>> => {
    const dateNow = DateTime.fromJSDate(new Date()).toFormat("d MMMM yyyy");
    const apiResponse: ApiResponse<Transaction> = await putTransaction(session, companyNumber, transactionId, DESCRIPTION + dateNow, transactionStatuses.CLOSED);
    return Promise.resolve(apiResponse);
};

/**
 * PUT transaction
 */
export const putTransaction = async (session: Session,
                                     companyNumber: string,
                                     transactionId: string,
                                     transactionDescription: string,
                                     transactionStatus: string): Promise<ApiResponse<Transaction>> => {
    const apiClient: ApiClient = createPublicOAuthApiClient(session);

    const transaction: Transaction = {
        companyNumber,
        description: transactionDescription,
        id: transactionId,
        reference: REFERENCE,
        status: transactionStatus
    };

    logger.debug(`Updating transaction id ${transactionId} with company number ${companyNumber}, status ${transactionStatus}`);
    const sdkResponse: ApiResponse<Transaction> | ApiErrorResponse = await apiClient.transaction.putTransaction(transaction);

    if (!sdkResponse) {
        throw createAndLogError(SERVICE_UNAVAILABLE, `Transaction API PUT request returned no response for transaction id ${transactionId}, company number ${companyNumber}`);
    }

    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= 400) {
        throw createAndLogError(SOMETHING_HAS_GONE_WRONG, `Http status code ${sdkResponse.httpStatusCode} - Failed to put transaction for transaction id ${transactionId}, company number ${companyNumber}`);
    }

    const castedSdkResponse: ApiResponse<Transaction> = sdkResponse as ApiResponse<Transaction>;

    logger.debug(`Received transaction ${JSON.stringify(sdkResponse)}`);

    return castedSdkResponse;
};
