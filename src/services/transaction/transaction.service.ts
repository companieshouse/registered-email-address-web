import { Resource } from "@companieshouse/api-sdk-node";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { createAndLogError, logger } from "../../utils/common/Logger";
import { THERE_IS_A_PROBLEM_ERROR } from "../../constants/app.const";
import { createPublicOAuthApiClient } from "../api/api.service";
import { Session } from "@companieshouse/node-session-handler";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { ApiErrorResponse, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { StatusCodes } from "http-status-codes";

import {
  DESCRIPTION,
  REFERENCE,
  transactionStatuses
} from "../../config";

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
    throw createAndLogError( THERE_IS_A_PROBLEM_ERROR, `Transaction API POST request returned no response for company number ${companyNumber}`);
  }

  if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= StatusCodes.BAD_REQUEST) {
    throw createAndLogError( THERE_IS_A_PROBLEM_ERROR, `Http status code ${sdkResponse.httpStatusCode} - Failed to post transaction for company number ${companyNumber}`);
  }

  const castedSdkResponse: Resource<Transaction> = sdkResponse as Resource<Transaction>;

  if (!castedSdkResponse.resource) {
    throw createAndLogError( THERE_IS_A_PROBLEM_ERROR, `Transaction API POST request returned no resource for company number ${companyNumber}`);
  }

  logger.debug(`Received transaction ${JSON.stringify(sdkResponse)}`);

  return castedSdkResponse.resource;
};

/**
 * Close transaction
 */
export const closeTransaction = async (session: Session, companyNumber: string, transactionId: string): Promise<ApiResponse<Transaction>> => {
  const apiResponse: ApiResponse<Transaction> = await putTransaction(session, companyNumber, transactionId, DESCRIPTION, transactionStatuses.CLOSED);
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
    throw createAndLogError( THERE_IS_A_PROBLEM_ERROR, `Transaction API PUT request returned no response for transaction id ${transactionId}, company number ${companyNumber}`);
  }

  if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= StatusCodes.BAD_REQUEST) {
    throw createAndLogError( THERE_IS_A_PROBLEM_ERROR, `Http status code ${sdkResponse.httpStatusCode} - Failed to put transaction for transaction id ${transactionId}, company number ${companyNumber}`);
  }

  const castedSdkResponse: ApiResponse<Transaction> = sdkResponse as ApiResponse<Transaction>;

  logger.debug(`Received transaction ${JSON.stringify(sdkResponse)}`);

  return castedSdkResponse;
};
