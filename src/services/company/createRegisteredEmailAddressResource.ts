import {Session} from "@companieshouse/node-session-handler";
import {HttpResponse} from "@companieshouse/api-sdk-node/dist/http/http-client";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import {createPublicOAuthApiClient} from "../api/api.service";
import {FAILED_TO_CREATE_REA_ERROR} from "../../constants/app.const";
import {StatusCodes} from "http-status-codes";

export const createRegisteredEmailAddressResource = async (session: Session, transactionId: string, companyEmail: string): Promise<Awaited<HttpResponse>> => {
    const apiClient: ApiClient = createPublicOAuthApiClient(session);
    const apiResponse: HttpResponse = await apiClient.apiClient.httpPost(`/transactions/${transactionId}/registered-email-address`, {registered_email_address: companyEmail});
    if (apiResponse.status === StatusCodes.CREATED) {
        return Promise.resolve(apiResponse);
    } else {
        return Promise.reject(FAILED_TO_CREATE_REA_ERROR);
    }
};
