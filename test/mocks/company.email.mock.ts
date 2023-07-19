jest.mock("../../src/services/company/company.email.service");

import { Resource } from "@companieshouse/api-sdk-node";
import { RegisteredEmailAddress } from "../../src/services/api/private-get-rea";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { StatusCodes } from 'http-status-codes';

const email: string = "test@test.co.biz";

const validEmail: RegisteredEmailAddress = {
  registeredEmailAddress: email
};

export const validEmailSDKResource: Resource<RegisteredEmailAddress> = {
  httpStatusCode: StatusCodes.OK,
  resource: validEmail
};

export const EmailErrorReponse: ApiErrorResponse = {
  httpStatusCode: StatusCodes.INTERNAL_SERVER_ERROR
};
