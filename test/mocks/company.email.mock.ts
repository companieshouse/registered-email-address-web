jest.mock("../../src/services/company/company.email.service");

import { Resource } from "@companieshouse/api-sdk-node";
import { companyEmailResource, companyEmail } from "../../src/services/company/resources/resources";
import { StatusCodes } from 'http-status-codes';

const validEmail: string = "test@test.co.biz";
const email: companyEmail = {
    companyEmail: validEmail
}

export const emailResource: Resource<companyEmail> = {
    httpStatusCode: StatusCodes.OK,
    resource: email
};

