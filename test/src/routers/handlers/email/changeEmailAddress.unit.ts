// jest.mock("../../../../src/services/transaction/transaction.service");
jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../../../src/services/api/api.service");
jest.mock("../../../../../src/utils/common/Logger");

import "reflect-metadata";
import { Request, Response } from "express";
import { createRequest, createResponse, MockRequest, MockResponse } from 'node-mocks-http';
import { ChangeEmailAddressHandler } from "../../../../../src/routers/handlers/email/changeEmailAddress";
import FormValidator from "../../../../../src/utils/common/formValidator.util";
import { Session } from "@companieshouse/node-session-handler";
import { COMPANY_EMAIL, COMPANY_NUMBER, SUBMISSION_ID, TRANSACTION_CREATE_ERROR, NO_EMAIL_ADDRESS_SUPPLIED, EMAIL_ADDRESS_INVALID } from "../../../../../src/constants/app.const";
import { validTransactionSDKResource, transactionId } from "../../../../mocks/transaction.mock";
import { queryReponse, EmailErrorReponse } from "../../../../mocks/company.email.mock";
import { createApiClient } from "@companieshouse/api-sdk-node";
import { createPublicOAuthApiClient } from "../../../../../src/services/api/api.service";
import { createAndLogError } from "../../../../../src/utils/common/Logger";

const COMPANY_NO: string = "1234567";
const TEST_EMAIL_EXISTING: string = "test@test.co.biz";
const TEST_EMAIL_UPDATE: string = "new_test@test.co.biz";
const PAGE_TITLE: string = "Update a registered email address";
const BACK_LINK_PATH: string = "/registered-email-address/company/confirm";
const CREATE_TRANSACTION_ERROR: string = TRANSACTION_CREATE_ERROR+COMPANY_NO;
const INVALID_EMAIL_ADDRESS: string = "test-test.co.biz";

// create form validator instance
const formValidator = new FormValidator();
// default handler instance
let changeEmailAddressHandler: ChangeEmailAddressHandler;

// mocking block - transaction
const mockCreatePublicOAuthApiClient = createPublicOAuthApiClient as jest.Mock;
const mockPostTransactionResponse = jest.fn();
mockCreatePublicOAuthApiClient.mockReturnValue({
  transaction: {
    postTransaction: mockPostTransactionResponse
  }
});

// mocking block - company email
const mockCreateApiClient = createApiClient as jest.Mock;
const mockGetCompanyEmailResponse = jest.fn();
mockCreateApiClient.mockReturnValue({
  apiClient: {
    httpGet: mockGetCompanyEmailResponse
  }
});
// request/response/session
let session: Session;
let request: MockRequest<Request>;
let response: MockResponse<Response>;

// mocking block - logging
const mockCreateAndLogError = createAndLogError as jest.Mock;
mockCreateAndLogError.mockReturnValue(new Error());

// clone response processor
const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Registered email address update - test GET method", () => {
  // clear down mocks
  beforeEach(() => {
    jest.clearAllMocks();
    changeEmailAddressHandler = new ChangeEmailAddressHandler(
      formValidator, 
      TEST_EMAIL_EXISTING
    );
    // session instance
    session = new Session();
    // mock request/responses
    request = createRequest({
      session: session
    });
    response = createResponse();
  });
  
  it("Handle error returned from creating transaction record", async () => {
    // build required transaction response for test
    mockPostTransactionResponse.mockResolvedValueOnce(clone(EmailErrorReponse));
    //set company number in session
    request.session?.setExtraData(COMPANY_NUMBER, COMPANY_NO);

    await changeEmailAddressHandler.get(request, response).then((changeEmailAddressResponse) => {
      const changeEmailAddressResponseJson = JSON.parse(JSON.stringify(changeEmailAddressResponse));

      expect(changeEmailAddressResponseJson.errors).toBeTruthy;
      expect(changeEmailAddressResponseJson.backUri).toEqual(BACK_LINK_PATH);
      expect(changeEmailAddressResponseJson.errors.companyNumber).toEqual(CREATE_TRANSACTION_ERROR);
    });
  });

  it("Registered email address update - company email in session", async () => {
    mockPostTransactionResponse.mockResolvedValueOnce(clone(validTransactionSDKResource));
    //set email in session
    request.session?.setExtraData(COMPANY_EMAIL, TEST_EMAIL_EXISTING);

    await changeEmailAddressHandler.get(request, response).then((changeEmailAddressResponse) => {
      const changeEmailAddressResponseJson = JSON.parse(JSON.stringify(changeEmailAddressResponse));
      expect(changeEmailAddressResponseJson.companyEmailAddress).toEqual(TEST_EMAIL_EXISTING);
      expect(changeEmailAddressResponseJson.backUri).toEqual(BACK_LINK_PATH);
      expect(changeEmailAddressResponseJson.userEmail).toEqual(TEST_EMAIL_EXISTING);
      expect(changeEmailAddressResponseJson.title).toEqual(PAGE_TITLE);
    });
  });

  it("Valid transaction created", async () => {
    // build required transaction response for test
    mockPostTransactionResponse.mockResolvedValueOnce(clone(validTransactionSDKResource));
    mockGetCompanyEmailResponse.mockResolvedValueOnce(clone(queryReponse));
    //set company number in session
    request.session?.setExtraData(COMPANY_NUMBER, COMPANY_NO);

    await changeEmailAddressHandler.get(request, response).then((changeEmailAddressResponse) => {
      const changeEmailAddressResponseJson = JSON.parse(JSON.stringify(changeEmailAddressResponse));

      expect(changeEmailAddressResponseJson.companyEmailAddress).toEqual(TEST_EMAIL_EXISTING);
      expect(changeEmailAddressResponseJson.backUri).toEqual(BACK_LINK_PATH);
      expect(changeEmailAddressResponseJson.userEmail).toEqual(TEST_EMAIL_EXISTING);
      expect(changeEmailAddressResponseJson.title).toEqual(PAGE_TITLE);
      expect(request.session?.getExtraData(SUBMISSION_ID)).toBeTruthy;
      expect(request.session?.getExtraData(SUBMISSION_ID)).toEqual(transactionId);
    });
  });
});

describe("Registered email address update - test POST method", () => {
  // clear down mocks
  beforeEach(() => {
    jest.clearAllMocks();
    changeEmailAddressHandler = new ChangeEmailAddressHandler(
      formValidator, 
      TEST_EMAIL_EXISTING
    );
    // session instance
    session = new Session();
    // mock request/responses
    request = createRequest({
      session: session
    });
    response = createResponse();
  });
  
  it("No email in POST request body - return view data error", async () => {
    //set email address in request body to empty
    request.body.changeEmailAddress = "";

    await changeEmailAddressHandler.post(request, response).then((changeEmailAddressResponse) => {
      const changeEmailAddressResponseJson = JSON.parse(JSON.stringify(changeEmailAddressResponse));

      expect(changeEmailAddressResponseJson.errors).toBeTruthy;
      expect(changeEmailAddressResponseJson.backUri).toEqual(BACK_LINK_PATH);
      expect(changeEmailAddressResponseJson.errors.changeEmailAddress).toEqual(NO_EMAIL_ADDRESS_SUPPLIED);
    });
  });

  it("Updated email address supplied does not match expected patter - return view data error", async () => {
    //set email address in request body to invalid pattern
    request.body.changeEmailAddress = INVALID_EMAIL_ADDRESS;

    await changeEmailAddressHandler.post(request, response).then((changeEmailAddressResponse) => {
      const changeEmailAddressResponseJson = JSON.parse(JSON.stringify(changeEmailAddressResponse));

      expect(changeEmailAddressResponseJson.errors).toBeTruthy;
      expect(changeEmailAddressResponseJson.backUri).toEqual(BACK_LINK_PATH);
      expect(changeEmailAddressResponseJson.errors.changeEmailAddress).toEqual(EMAIL_ADDRESS_INVALID);
    });
  });

  it("Valid email address supplied", async () => {
    //set email address in request body to invalid pattern
    request.body.changeEmailAddress = TEST_EMAIL_UPDATE;

    await changeEmailAddressHandler.post(request, response).then((changeEmailAddressResponse) => {
      const changeEmailAddressResponseJson = JSON.parse(JSON.stringify(changeEmailAddressResponse));

      expect(changeEmailAddressResponseJson.errors).toBeFalsy;
      expect(changeEmailAddressResponseJson.backUri).toEqual(BACK_LINK_PATH);
      expect(changeEmailAddressResponseJson.userEmail).toEqual(TEST_EMAIL_EXISTING);
      expect(changeEmailAddressResponseJson.title).toEqual(PAGE_TITLE);
      expect(changeEmailAddressResponseJson.signoutBanner).toBeTruthy;
    });
  });
});
