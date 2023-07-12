jest.mock("../../src/services/company/company.email.service");
jest.mock("../../src/services/api/private-get-rea/privateApiClient");

import { Resource } from "@companieshouse/api-sdk-node";
import { RegisteredEmailAddress } from "../../src/services/api/private-get-rea";
import { StatusCodes } from 'http-status-codes';

const validEmail: string = "test@test.co.biz";
const email: RegisteredEmailAddress = {
  registeredEmailAddress: validEmail
};

export const validEmailSDKResource: Resource<RegisteredEmailAddress> = {
  httpStatusCode: StatusCodes.OK,
  resource: email
};
