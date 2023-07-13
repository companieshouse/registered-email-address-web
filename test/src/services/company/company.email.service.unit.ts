import {
    getCompanyEmail
} from "../../../../src/services/company/company.email.service";
import {createApiClient, Resource} from "@companieshouse/api-sdk-node";
import {createAndLogError} from "../../../../src/lib/Logger";
import {validEmailSDKResource} from "../../../mocks/company.email.mock";
import {companyEmail} from "../../../../src/services/company/resources/resources";
import {HttpResponse} from "@companieshouse/api-sdk-node/dist/http/http-client";
import {StatusCodes} from 'http-status-codes';
import {Request} from "express";
import {UPDATED_COMPANY_EMAIL} from "../../../../src/constants/app.const";
import {Session} from "@companieshouse/node-session-handler";

import * as rea from '../../../../src/services/company/createRegisteredEmailAddressResource';
import * as transactions from '../../../../src/services/transaction/transaction.service';
import {closeTransaction} from '../../../../src/services/transaction/transaction.service';
import {
    handleGetCheckRequest,
    handlePostCheckRequest
} from "../../../../src/routers/handlers/email/confirmEmailChange";

jest.mock("../../../../src/services/company/createRegisteredEmailAddressResource");
jest.mock("../../../../src/services/transaction/transaction.service");
jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../../src/lib/Logger");

const mockCreateApiClient = createApiClient as jest.Mock;
const mockGetCompanyEmail = jest.fn();
const mockCreateAndLogError = createAndLogError as jest.Mock;

mockCreateApiClient.mockReturnValue({
    apiClient: {
        httpGet: mockGetCompanyEmail
    }
});

mockCreateAndLogError.mockReturnValue(new Error());

const clone = (objectToClone: any): any => {
    return JSON.parse(JSON.stringify(objectToClone));
};

describe("Company email address service test", () => {
    const COMPANY_NUMBER = "1234567";
    const TEST_EMAIL = "test@test.co.biz";
    const OK_RESPONSE_BODY = {"registered_email_address": `${TEST_EMAIL}`};

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getCompanyProfile tests", () => {
        it("Should return a company email address", async () => {
            const queryReponse: HttpResponse = {
                status: StatusCodes.OK,
                body: OK_RESPONSE_BODY
            };
            mockGetCompanyEmail.mockResolvedValueOnce(clone(queryReponse));
            const returnedEmail: Resource<companyEmail> = await getCompanyEmail(COMPANY_NUMBER);

            Object.getOwnPropertyNames(validEmailSDKResource.resource).forEach(property => {
                expect(returnedEmail.httpStatusCode).toEqual(StatusCodes.OK);
                expect(returnedEmail.resource).toHaveProperty(property);
                expect(returnedEmail.resource?.companyEmail).toEqual(TEST_EMAIL);
            });
        });

        it("Should return the received error code if response status >= 400", async () => {
            const queryReponse: HttpResponse = {
                status: StatusCodes.BAD_REQUEST
            };
            mockGetCompanyEmail.mockResolvedValueOnce(clone(queryReponse));

            const returnedEmail: Resource<companyEmail> = await getCompanyEmail(COMPANY_NUMBER);

            Object.getOwnPropertyNames(validEmailSDKResource.resource).forEach(() => {
                expect(returnedEmail.httpStatusCode).toEqual(StatusCodes.BAD_REQUEST);
                expect(returnedEmail.resource).toBeNull;
            });
        });
    });

    describe("Check your answer tests", () => {
        test("Should return data required in check your answer page", async () => {
            const mockRequest = {} as Request;
            const session = new Session();
            mockRequest.session = session;
            session.setExtraData(UPDATED_COMPANY_EMAIL, "test@test.com");

            const result = await handleGetCheckRequest(mockRequest)
                .then(function (result) {
                    return result;
                });

            expect(result).toMatchObject({"updatedCompanyEmail": "test@test.com"});
            expect(result).toMatchObject({backUri: "/registered-email-address/email/change-email-address"});
            expect(result).toMatchObject({signoutBanner: true});
            expect(result).toMatchObject({userEmail: undefined});
        });

        test("Should return data required in confirmation page", async () => {
            const mockRequest = {
                body: {emailConfirmation: "confirm"}
            } as Request;

            const createREAResourceResponse: HttpResponse = {
                status: StatusCodes.CREATED,
                body: {},
                headers: {}
            }

            const closeTransResponse: HttpResponse = {
                status: StatusCodes.NO_CONTENT,
                headers: {}
            }

            mockRequest.session = new Session();

            jest.spyOn(rea, 'createRegisteredEmailAddressResource').mockResolvedValue(clone(createREAResourceResponse));
            jest.spyOn(transactions, 'closeTransaction').mockResolvedValue(clone(closeTransResponse));

            const result = await handlePostCheckRequest(mockRequest)
                .then(function (result) {
                    return result;
                });

            expect(result).toMatchObject({backUri: "/registered-email-address/email/change-email-address"});
            expect(result).toMatchObject({signoutBanner: true});
            expect(result).toMatchObject({userEmail: undefined});
        });

        test("Should reject continue when not confirmed", async () => {
            const mockRequest = {
                body: {},
            } as Request;
            const session = new Session();
            mockRequest.session = session;
            session.setExtraData(UPDATED_COMPANY_EMAIL, "test@test.com");

            const result = await handlePostCheckRequest(mockRequest)
                .then(function (result) {
                    return result;
                });

            expect(result).toMatchObject({statementError: "You need to accept the registered email address statement"});
            expect(result).toMatchObject({updatedCompanyEmail: "test@test.com"});
            expect(result).toMatchObject({backUri: "/registered-email-address/email/change-email-address"});
        });

        it("Should throw an error on failure to create registered email address resource", async () => {
            const mockRequest = {
                body: {emailConfirmation: "confirm"}
            } as Request;
            const session = new Session();
            mockRequest.session = session;
            session.setExtraData(UPDATED_COMPANY_EMAIL, "test@test.com");

            const createREAResourceResponse: HttpResponse = {
                status: StatusCodes.BAD_REQUEST,
                body: {},
                headers: {}
            }

            jest.spyOn(rea, 'createRegisteredEmailAddressResource').mockRejectedValue((clone(createREAResourceResponse)));

            const result = await handlePostCheckRequest(mockRequest)
                .then(function (result) {
                    return result;
                });

            expect(result).toMatchObject({statementError: "Unable to close a transaction record for company undefined"});
            expect(result).toMatchObject({updatedCompanyEmail: "test@test.com"});
            expect(result).toMatchObject({backUri: "/registered-email-address/email/change-email-address"});
            expect(result).toMatchObject({signoutBanner: true});
            expect(result).toMatchObject({userEmail: undefined});
        });

        it("Should throw an error on failure to close transaction", async () => {
            const mockRequest = {
                body: {emailConfirmation: "confirm"}
            } as Request;
            const session = new Session();
            mockRequest.session = session;
            session.setExtraData(UPDATED_COMPANY_EMAIL, "test@test.com");

            const createREAResourceResponse: HttpResponse = {
                status: StatusCodes.OK,
                body: {},
                headers: {}
            }

            const closeTransResponse: HttpResponse = {
                status: StatusCodes.BAD_REQUEST,
                headers: {}
            }

            jest.spyOn(rea, 'createRegisteredEmailAddressResource').mockResolvedValue((clone(createREAResourceResponse)));
            jest.spyOn(transactions, 'closeTransaction').mockRejectedValue(new Error("anything"));

            const result = await handlePostCheckRequest(mockRequest)
                .then(function (result) {
                    return result;
                });

            expect(result).toMatchObject({statementError: "anything"});
            expect(result).toMatchObject({updatedCompanyEmail: "test@test.com"});
            expect(result).toMatchObject({backUri: "/registered-email-address/email/change-email-address"});
            expect(result).toMatchObject({signoutBanner: true});
            expect(result).toMatchObject({userEmail: undefined});
        });
    });
});
