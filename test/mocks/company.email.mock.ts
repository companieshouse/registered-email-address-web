jest.mock("../../src/services/company/company.email.service");

import { Resource } from "@companieshouse/api-sdk-node";
import { companyEmailResource, companyEmail } from "../../src/services/company/resources/resources";
import { StatusCodes } from 'http-status-codes';
import { HttpResponse } from "@companieshouse/api-sdk-node/dist/http/http-client";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

const validEmail: string = "test@test.co.biz";
const email: companyEmail = {
    companyEmail: validEmail
}
const OK_RESPONSE_BODY: any = {"registered_email_address": `${validEmail}`};

export const validEmailSDKResource: Resource<companyEmail> = {
    httpStatusCode: StatusCodes.OK,
    resource: email
};

export const queryReponse: HttpResponse = {
    status: StatusCodes.OK,
    body: OK_RESPONSE_BODY
};

export const EmailErrorReponse: ApiErrorResponse = {
    httpStatusCode: StatusCodes.INTERNAL_SERVER_ERROR
};
