import "reflect-metadata";
import {getCompanyEmail} from "../../../../src/services/company/company.email.service";
import {createApiClient, Resource} from "@companieshouse/api-sdk-node";
import {validEmailSDKResource} from "../../../mocks/company.email.mock";
import {companyEmail} from "../../../../src/services/company/resources/resources";
import {HttpResponse} from "@companieshouse/api-sdk-node/dist/http/http-client";
import {StatusCodes} from 'http-status-codes';
import {Request, Response} from "express";
import {COMPANY_EMAIL} from "../../../../src/constants/app.const";
import {Session} from "@companieshouse/node-session-handler";

import * as rea from '../../../../src/services/company/createRegisteredEmailAddressResource';
import * as transactions from '../../../../src/services/transaction/transaction.service';
import {CheckAnswerHandler} from "../../../../src/routers/handlers/email/checkAnswer";
import {createResponse, MockResponse} from "node-mocks-http";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../../src/lib/Logger");

const mockCreateApiClient = createApiClient as jest.Mock;
const mockGetCompanyEmail = jest.fn();

let session: Session;
let response: MockResponse<Response>;

mockCreateApiClient.mockReturnValue({
    apiClient: {
        httpGet: mockGetCompanyEmail
    }
});

const createdResponse: HttpResponse = {status: StatusCodes.CREATED};
const noContentResponse: HttpResponse = {status: StatusCodes.NO_CONTENT};
const okResponse: HttpResponse = {status: StatusCodes.OK};

const clone = (objectToClone: any): any => {
    return JSON.parse(JSON.stringify(objectToClone));
};

describe("Company email address service test", () => {
    const COMPANY_NUMBER = "1234567";
    const TEST_EMAIL = "test@test.co.biz";
    const OK_RESPONSE_BODY = {"registered_email_address": `${TEST_EMAIL}`};

    beforeEach(() => {
        jest.clearAllMocks();
        session = new Session();
        response = createResponse();
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
        it("Should return data required in check your answer page", async () => {
            const mockRequest = {} as Request;
            mockRequest.session = session;
            session.setExtraData(COMPANY_EMAIL, "test@test.com");

            await new CheckAnswerHandler().get(mockRequest, response).then((result) => {
                expect(result).toMatchObject({"companyEmail": "test@test.com"});
                expect(result).toMatchObject({backUri: "/registered-email-address/email/change-email-address"});
                expect(result).toMatchObject({signoutBanner: true});
                expect(result).toMatchObject({userEmail: undefined});
            });
        });

        it("Should return data required in confirmation page", async () => {
            const mockRequest = {
                body: {emailConfirmation: "confirm"}
            } as Request;

            mockRequest.session = new Session();

            jest.spyOn(rea, 'createRegisteredEmailAddressResource').mockResolvedValue(clone(createdResponse));
            jest.spyOn(transactions, 'closeTransaction').mockResolvedValue(clone(noContentResponse));

            await new CheckAnswerHandler().post(mockRequest, response).then((result) => {
                expect(result).toMatchObject({backUri: "/registered-email-address/email/change-email-address"});
                expect(result).toMatchObject({signoutBanner: true});
                expect(result).toMatchObject({userEmail: undefined});
            });
        });

        it("Should reject continue when not confirmed", async () => {
            const mockRequest = {
                body: {},
            } as Request;
            mockRequest.session = session;
            session.setExtraData(COMPANY_EMAIL, "test@test.com");

            await new CheckAnswerHandler().post(mockRequest, response).then((result) => {
                expect(result).toMatchObject({statementError: "You need to accept the registered email address statement"});
                expect(result).toMatchObject({companyEmail: "test@test.com"});
                expect(result).toMatchObject({backUri: "/registered-email-address/email/change-email-address"});
            });
        });

        it("Should throw an error on failure to create REA resource", async () => {
            const mockRequest = {
                body: {emailConfirmation: "confirm"}
            } as Request;
            mockRequest.session = session;
            session.setExtraData(COMPANY_EMAIL, "test@test.com");

            jest.spyOn(rea, 'createRegisteredEmailAddressResource').mockRejectedValue("anything");

            await new CheckAnswerHandler().post(mockRequest, response).then((result) => {
                expect(result).toMatchObject({statementError: "Unable to close a transaction record for company undefined"});
                expect(result).toMatchObject({companyEmail: "test@test.com"});
                expect(result).toMatchObject({backUri: "/registered-email-address/email/change-email-address"});
                expect(result).toMatchObject({signoutBanner: true});
                expect(result).toMatchObject({userEmail: undefined});
            });
        });

        it("Should throw an error on failure to close transaction", async () => {
            const mockRequest = {
                body: {emailConfirmation: "confirm"}
            } as Request;
            mockRequest.session = session;
            session.setExtraData(COMPANY_EMAIL, "test@test.com");

            jest.spyOn(rea, 'createRegisteredEmailAddressResource').mockResolvedValue((clone(okResponse)));
            jest.spyOn(transactions, 'closeTransaction').mockRejectedValue(new Error("anything"));

            await new CheckAnswerHandler().post(mockRequest, response).then((result) => {
                expect(result).toMatchObject({statementError: "anything"});
                expect(result).toMatchObject({companyEmail: "test@test.com"});
                expect(result).toMatchObject({backUri: "/registered-email-address/email/change-email-address"});
                expect(result).toMatchObject({signoutBanner: true});
                expect(result).toMatchObject({userEmail: undefined});
            });
        });
    });
});
