jest.mock("../../src/services/company/company_email_service");

import { Resource } from "@companieshouse/api-sdk-node";
import {RegisteredEmailAddress} from "@companieshouse/api-sdk-node/dist/services/registered-email-address/types";
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

export const EmailNotFoundResponse: Resource<RegisteredEmailAddress> = {
  httpStatusCode: StatusCodes.NOT_FOUND
};

export const EmailErrorResponse: Resource<RegisteredEmailAddress> = {
  httpStatusCode: StatusCodes.INTERNAL_SERVER_ERROR
};
