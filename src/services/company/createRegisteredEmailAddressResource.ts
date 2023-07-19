import {Session} from "@companieshouse/node-session-handler";
import {HttpResponse} from "@companieshouse/api-sdk-node/dist/http/http-client";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import {createPublicOAuthApiClient} from "../api/api.service";
import {FAILED_TO_CREATE_REA_ERROR} from "../../constants/app.const";
import {StatusCodes} from "http-status-codes";
import { logger } from "../../lib/Logger";

export const createRegisteredEmailAddressResource = async (session: Session, transactionId: string, companyEmail: string): Promise<Awaited<HttpResponse>> => {
  const apiClient: ApiClient = createPublicOAuthApiClient(session);
  const apiResponse: HttpResponse = await apiClient.apiClient.httpPost(`/transactions/${transactionId}/registered-email-address`, {registered_email_address: companyEmail});
  if (apiResponse.status === StatusCodes.CREATED) {
    logger.info(`Successfully created registered-email-resource for transaction: ${transactionId}, email: ${companyEmail}`);
    return Promise.resolve(apiResponse);
  } else {
    logger.error(`Failed to create registered-email-resource for transaction: ${transactionId}, status: ${apiResponse.status}`);
    return Promise.reject(FAILED_TO_CREATE_REA_ERROR);
  }
};
