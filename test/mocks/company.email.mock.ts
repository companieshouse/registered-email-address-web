jest.mock("../../src/services/company/company.email.service");
jest.mock("../../src/services/api/private-get-rea/privateApiClient");

import { Resource } from "@companieshouse/api-sdk-node";
import { RegisteredEmailAddress } from "../../src/services/api/private-get-rea";
import { StatusCodes } from 'http-status-codes';
import { HttpResponse } from "@companieshouse/api-sdk-node/dist/http/http-client";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

const validEmail: string = "test@test.co.biz";
const email: RegisteredEmailAddress = {
  registeredEmailAddress: validEmail
};

export const validEmailSDKResource: Resource<RegisteredEmailAddress> = {
  httpStatusCode: StatusCodes.OK,
  resource: email
};
const OK_RESPONSE_BODY: any = {"registered_email_address": `${validEmail}`};

export const queryReponse: HttpResponse = {
  status: StatusCodes.OK,
  body: OK_RESPONSE_BODY
};

export const errorReponse: ApiErrorResponse = {
  httpStatusCode: StatusCodes.INTERNAL_SERVER_ERROR
};