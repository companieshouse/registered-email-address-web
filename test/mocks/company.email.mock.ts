jest.mock("../../src/services/company/company.email.service");

import { Resource } from "@companieshouse/api-sdk-node";
import {RegisteredEmailAddress} from "@companieshouse/api-sdk-node/dist/services/registered-email-address/types";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { StatusCodes } from 'http-status-codes';

const email: string = "test@test.co.biz";
const statement: boolean = true;

const validEmail: RegisteredEmailAddress = {
  registeredEmailAddress: email,
  acceptAppropriateEmailAddressStatement: statement
};

export const validEmailSDKResource: Resource<RegisteredEmailAddress> = {
  httpStatusCode: StatusCodes.OK,
  resource: validEmail
};

export const EmailNotFoundReponse: ApiErrorResponse = {
  httpStatusCode: StatusCodes.NOT_FOUND
};

export const EmailErrorReponse: ApiErrorResponse = {
  httpStatusCode: StatusCodes.INTERNAL_SERVER_ERROR
};
