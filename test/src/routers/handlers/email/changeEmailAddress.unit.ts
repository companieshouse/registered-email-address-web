jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../../../src/services/api/api.service");
jest.mock("../../../../../src/utils/common/Logger");

import "reflect-metadata";
import {Request, Response} from "express";
import {createRequest, createResponse, MockRequest, MockResponse} from 'node-mocks-http';
import {ChangeEmailAddressHandler} from "../../../../../src/routers/handlers/email/changeEmailAddress";
import FormValidator from "../../../../../src/utils/common/formValidator.util";
import {Session} from "@companieshouse/node-session-handler";
import {
  COMPANY_NUMBER,
  COMPANY_PROFILE,
  EMAIL_ADDRESS_INVALID,
  NO_EMAIL_ADDRESS_FOUND,
  NO_EMAIL_ADDRESS_SUPPLIED,
  REGISTERED_EMAIL_ADDRESS,
  SUBMISSION_ID,
  TRANSACTION_CREATE_ERROR,
  UPDATE_EMAIL_ERROR_ANCHOR
} from "../../../../../src/constants/app.const";
import {transactionId, validTransactionSDKResource} from "../../../../mocks/transaction.mock";
import {EmailErrorReponse, validEmailSDKResource} from "../../../../mocks/company.email.mock";
import {createApiClient} from "@companieshouse/api-sdk-node";
import {createPublicOAuthApiClient} from "../../../../../src/services/api/api.service";
import {createAndLogError} from "../../../../../src/utils/common/Logger";
import {validCompanyProfile} from "../../../../mocks/company.profile.mock";
import {StatusCodes} from "http-status-codes";

const COMPANY_NO: string = "12345678";
const TEST_EMAIL_EXISTING: string = "test@test.co.biz";
const TEST_EMAIL_UPDATE: string = "new_test@test.co.biz";
const BACK_LINK_PATH: string = "/registered-email-address/company/confirm";
const CREATE_TRANSACTION_ERROR: string = TRANSACTION_CREATE_ERROR + COMPANY_NO;
const INVALID_EMAIL_ADDRESS: string = "test-test.co.biz";
const PROFILE = validCompanyProfile;
const TEST_COMPANY_NAME: string = "TEST COMPANY";

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

describe("Change email address - tests", () => {

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
      request.session?.setExtraData(REGISTERED_EMAIL_ADDRESS, TEST_EMAIL_EXISTING);
      request.session?.setExtraData(COMPANY_PROFILE, PROFILE);

      await changeEmailAddressHandler.get(request, response).catch((changeEmailAddressResponse) => {
        const changeEmailAddressResponseJson = JSON.parse(JSON.stringify(changeEmailAddressResponse));

        expect(changeEmailAddressResponseJson.errors).toBeTruthy;
        expect(changeEmailAddressResponseJson.errors.errorList).toBeTruthy;
        expect(changeEmailAddressResponseJson.errors.changeEmailAddress).toEqual(CREATE_TRANSACTION_ERROR);
        expect(changeEmailAddressResponseJson.errors.errorList).toHaveLength(1);
        expect(changeEmailAddressResponseJson.errors.errorList[0].href).toEqual(UPDATE_EMAIL_ERROR_ANCHOR);
        expect(changeEmailAddressResponseJson.errors.errorList[0].text).toEqual(CREATE_TRANSACTION_ERROR);
        expect(changeEmailAddressResponseJson.backUri).toEqual(BACK_LINK_PATH);
        expect(changeEmailAddressResponseJson.companyName).toEqual(TEST_COMPANY_NAME);
        expect(changeEmailAddressResponseJson.companyNumber).toEqual(COMPANY_NO);
        expect(changeEmailAddressResponseJson.companyEmailAddress).toEqual(TEST_EMAIL_EXISTING);
      });
    });

    it("Registered email address update - company email in session", async () => {
      validTransactionSDKResource.httpStatusCode = StatusCodes.CREATED;
      mockPostTransactionResponse.mockResolvedValueOnce(clone(validTransactionSDKResource));
      //set email in session
      request.session?.setExtraData(REGISTERED_EMAIL_ADDRESS, TEST_EMAIL_EXISTING);
      request.session?.setExtraData(COMPANY_NUMBER, COMPANY_NO);
      request.session?.setExtraData(COMPANY_PROFILE, PROFILE);

      await changeEmailAddressHandler.get(request, response).then((changeEmailAddressResponse) => {
        const changeEmailAddressResponseJson = JSON.parse(JSON.stringify(changeEmailAddressResponse));
        expect(changeEmailAddressResponseJson.companyEmailAddress).toEqual(TEST_EMAIL_EXISTING);
        expect(changeEmailAddressResponseJson.backUri).toEqual(BACK_LINK_PATH);
        expect(changeEmailAddressResponseJson.userEmail).toEqual(TEST_EMAIL_EXISTING);
        expect(changeEmailAddressResponseJson.companyName).toEqual(TEST_COMPANY_NAME);
        expect(changeEmailAddressResponseJson.companyNumber).toEqual(COMPANY_NO);
        expect(changeEmailAddressResponseJson.companyEmailAddress).toEqual(TEST_EMAIL_EXISTING);
      });
    });

    it("Registered email address update - company email not in session", async () => {
      validTransactionSDKResource.httpStatusCode = StatusCodes.CREATED;
      mockPostTransactionResponse.mockResolvedValueOnce(clone(validTransactionSDKResource));
      request.session?.setExtraData(COMPANY_NUMBER, COMPANY_NO);
      request.session?.setExtraData(COMPANY_PROFILE, PROFILE);

      await changeEmailAddressHandler.get(request, response).catch((changeEmailAddressResponse) => {
        const changeEmailAddressResponseJson = JSON.parse(JSON.stringify(changeEmailAddressResponse));

        expect(changeEmailAddressResponseJson.errors).toBeTruthy;
        expect(changeEmailAddressResponseJson.errors.errorList).toBeTruthy;
        expect(changeEmailAddressResponseJson.errors.changeEmailAddress).toEqual(NO_EMAIL_ADDRESS_FOUND);
        expect(changeEmailAddressResponseJson.errors.errorList).toHaveLength(1);
        expect(changeEmailAddressResponseJson.errors.errorList[0].href).toEqual(UPDATE_EMAIL_ERROR_ANCHOR);
        expect(changeEmailAddressResponseJson.errors.errorList[0].text).toEqual(NO_EMAIL_ADDRESS_FOUND);
        expect(changeEmailAddressResponseJson.backUri).toEqual(BACK_LINK_PATH);
      });
    });

    it("Valid transaction created", async () => {
    // build required transaction response for test
      validTransactionSDKResource.httpStatusCode = StatusCodes.CREATED;
      mockPostTransactionResponse.mockResolvedValueOnce(clone(validTransactionSDKResource));
      mockGetCompanyEmailResponse.mockResolvedValueOnce(clone(validEmailSDKResource));
      //set company number in session
      request.session?.setExtraData(REGISTERED_EMAIL_ADDRESS, TEST_EMAIL_EXISTING);
      request.session?.setExtraData(COMPANY_NUMBER, COMPANY_NO);
      request.session?.setExtraData(COMPANY_PROFILE, PROFILE);

      await changeEmailAddressHandler.get(request, response).then((changeEmailAddressResponse) => {
        const changeEmailAddressResponseJson = JSON.parse(JSON.stringify(changeEmailAddressResponse));

        expect(changeEmailAddressResponseJson.companyEmailAddress).toEqual(TEST_EMAIL_EXISTING);
        expect(changeEmailAddressResponseJson.backUri).toEqual(BACK_LINK_PATH);
        expect(changeEmailAddressResponseJson.userEmail).toEqual(TEST_EMAIL_EXISTING);
        expect(request.session?.getExtraData(SUBMISSION_ID)).toBeTruthy;
        expect(request.session?.getExtraData(SUBMISSION_ID)).toEqual(transactionId);
        expect(changeEmailAddressResponseJson.companyName).toEqual(TEST_COMPANY_NAME);
        expect(changeEmailAddressResponseJson.companyNumber).toEqual(COMPANY_NO);
        expect(changeEmailAddressResponseJson.companyEmailAddress).toEqual(TEST_EMAIL_EXISTING);
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
      request.session?.setExtraData(COMPANY_PROFILE, PROFILE);
      request.session?.setExtraData(REGISTERED_EMAIL_ADDRESS, TEST_EMAIL_EXISTING);

      await changeEmailAddressHandler.post(request, response).catch((changeEmailAddressResponse) => {
        const changeEmailAddressResponseJson = JSON.parse(JSON.stringify(changeEmailAddressResponse));

        expect(changeEmailAddressResponseJson.errors).toBeTruthy;
        expect(changeEmailAddressResponseJson.errors.errorList).toBeTruthy;
        expect(changeEmailAddressResponseJson.errors.changeEmailAddress).toEqual(NO_EMAIL_ADDRESS_SUPPLIED);
        expect(changeEmailAddressResponseJson.errors.errorList).toHaveLength(1);
        expect(changeEmailAddressResponseJson.errors.errorList[0].href).toEqual(UPDATE_EMAIL_ERROR_ANCHOR);
        expect(changeEmailAddressResponseJson.errors.errorList[0].text).toEqual(NO_EMAIL_ADDRESS_SUPPLIED);
        expect(changeEmailAddressResponseJson.backUri).toEqual(BACK_LINK_PATH);
        expect(changeEmailAddressResponseJson.companyName).toEqual(TEST_COMPANY_NAME);
        expect(changeEmailAddressResponseJson.companyNumber).toEqual(COMPANY_NO);
        expect(changeEmailAddressResponseJson.companyEmailAddress).toEqual(TEST_EMAIL_EXISTING);
      });
    });

    it("Updated email address supplied does not match expected pattern - return view data error", async () => {
    //set email address in request body to invalid pattern
      request.body.changeEmailAddress = INVALID_EMAIL_ADDRESS;
      request.session?.setExtraData(COMPANY_PROFILE, PROFILE);
      request.session?.setExtraData(REGISTERED_EMAIL_ADDRESS, TEST_EMAIL_EXISTING);

      await changeEmailAddressHandler.post(request, response).catch((changeEmailAddressResponse) => {
        const changeEmailAddressResponseJson = JSON.parse(JSON.stringify(changeEmailAddressResponse));

        expect(changeEmailAddressResponseJson.errors).toBeTruthy;
        expect(changeEmailAddressResponseJson.errors.changeEmailAddress).toEqual(EMAIL_ADDRESS_INVALID);
        expect(changeEmailAddressResponseJson.errors.errorList).toHaveLength(1);
        expect(changeEmailAddressResponseJson.errors.errorList[0].href).toEqual(UPDATE_EMAIL_ERROR_ANCHOR);
        expect(changeEmailAddressResponseJson.errors.errorList[0].text).toEqual(EMAIL_ADDRESS_INVALID);
        expect(changeEmailAddressResponseJson.backUri).toEqual(BACK_LINK_PATH);
        expect(changeEmailAddressResponseJson.errors.changeEmailAddress).toEqual(EMAIL_ADDRESS_INVALID);
        expect(changeEmailAddressResponseJson.companyName).toEqual(TEST_COMPANY_NAME);
        expect(changeEmailAddressResponseJson.companyNumber).toEqual(COMPANY_NO);
        expect(changeEmailAddressResponseJson.companyEmailAddress).toEqual(TEST_EMAIL_EXISTING);
      });
    });

    it("Valid email address supplied", async () => {
    //set email address in request body to invalid pattern
      request.body.changeEmailAddress = TEST_EMAIL_UPDATE;
      request.session?.setExtraData(COMPANY_PROFILE, PROFILE);
      request.session?.setExtraData(REGISTERED_EMAIL_ADDRESS, TEST_EMAIL_EXISTING);

      await changeEmailAddressHandler.post(request, response).then((changeEmailAddressResponse) => {
        const changeEmailAddressResponseJson = JSON.parse(JSON.stringify(changeEmailAddressResponse));

        expect(changeEmailAddressResponseJson.errors).toBeFalsy;
        expect(changeEmailAddressResponseJson.backUri).toEqual(BACK_LINK_PATH);
        expect(changeEmailAddressResponseJson.userEmail).toEqual(TEST_EMAIL_EXISTING);
        expect(changeEmailAddressResponseJson.signoutBanner).toBeTruthy;
        expect(changeEmailAddressResponseJson.companyName).toEqual(TEST_COMPANY_NAME);
        expect(changeEmailAddressResponseJson.companyNumber).toEqual(COMPANY_NO);
        expect(changeEmailAddressResponseJson.companyEmailAddress).toEqual(TEST_EMAIL_EXISTING);
      });
    });
  });
});
