import "reflect-metadata";
import {postRegisteredEmailAddress} from "../../../../../src/services/email/email.registered.service";
import {CheckAnswerHandler} from "../../../../../src/routers/handlers/email/checkAnswer";
import {Session} from "@companieshouse/node-session-handler";
import {createRequest, createResponse, MockRequest, MockResponse} from "node-mocks-http";
import {Request, Response} from "express";
import {
  CHECK_ANSWER_ERROR_ANCHOR,
  COMPANY_PROFILE,
  CONFIRM_EMAIL_CHANGE_ERROR,
  NEW_EMAIL_ADDRESS,
  SUBMISSION_ID
} from "../../../../../src/constants/app.const";
import {validCompanyProfile} from "../../../../mocks/company.profile.mock";
import {createSessionData} from "../../../../mocks/sessionGenerator.mock";
import {generateRandomBytesBase64} from "./updateSubmitted.unit";
// import {postRegisteredEmailAddress} from "../../../../../src/services/email/email.registered.service";
import {closeTransaction} from "../../../../../src/services/transaction/transaction.service";

jest.mock("../../../../../src/services/email/email.registered.service");
jest.mock("../../../../../src/services/transaction/transaction.service");

const PROFILE = validCompanyProfile;
const EMAIL_ADDRESS: string = "test@test.com";
const COMPANY_NAME: string = "TEST COMPANY";
const USER_EMAIL: string = "test_user@test.co.biz";
const COMPANY_NUMBER = "12345678";
const BACK_LINK_PATH: string = "/registered-email-address/email/change-email-address";
const TITLE: string = "Error: Check your answer";
const TRANSACTION_ID = "178417-909116-690426";
const cookieSecret = generateRandomBytesBase64(16);

const mockPostRegisteredEmailAddress = postRegisteredEmailAddress as jest.Mock;
const mockCloseTransaction = closeTransaction as jest.Mock;

// default handler instance
let checkAnswerHandler: CheckAnswerHandler;

let request: MockRequest<Request>;
let response: MockResponse<Response>;

describe("Check answer - tests", () => {

  // clear down mocks
  beforeEach(() => {
    jest.clearAllMocks();
    checkAnswerHandler = new CheckAnswerHandler();
    // session instance
    request = createRequest({
      session: new Session({
        ...createSessionData(cookieSecret)
      })
    });

    response = createResponse();
  });

  describe("GET method tests", () => {

    it("Returns expected data", async () => {
      request.session?.setExtraData(COMPANY_PROFILE, PROFILE);
      request.session?.setExtraData(NEW_EMAIL_ADDRESS, EMAIL_ADDRESS);

      await checkAnswerHandler.get(request, response).then((data) => {
        const dataJson = JSON.parse(JSON.stringify(data));
        expect(dataJson.userEmail).toEqual(USER_EMAIL);
        expect(dataJson.backUri).toEqual(BACK_LINK_PATH);
        expect(dataJson.companyEmail).toEqual(EMAIL_ADDRESS);
        expect(dataJson.companyName).toEqual(COMPANY_NAME);
        expect(dataJson.companyNumber).toEqual(COMPANY_NUMBER);
      });
    });

    describe("POST method tests", () => {

      it("Should reject incomplete data", async () => {
        request.session?.setExtraData(COMPANY_PROFILE, PROFILE);
        request.session?.setExtraData(NEW_EMAIL_ADDRESS, EMAIL_ADDRESS);

        await checkAnswerHandler.post(request, response).catch((data) => {
          const dataJson = JSON.parse(JSON.stringify(data));
          expect(dataJson.title).toEqual(TITLE);
          expect(dataJson.errors).toBeTruthy;
          expect(dataJson.errors.errorList).toBeTruthy;
          expect(dataJson.errors.emailConfirmation).toEqual(CONFIRM_EMAIL_CHANGE_ERROR);
          expect(dataJson.errors.errorList).toHaveLength(1);
          expect(dataJson.errors.errorList[0].href).toEqual(CHECK_ANSWER_ERROR_ANCHOR);
          expect(dataJson.errors.errorList[0].text).toEqual(CONFIRM_EMAIL_CHANGE_ERROR);
          expect(dataJson.statementError).toEqual(CONFIRM_EMAIL_CHANGE_ERROR);
          expect(dataJson.title).toEqual(TITLE);
        });
      });

      it("Should handle failure on create registered email address resource", async () => {
        request.body.emailConfirmation = "anything";
        request.session?.setExtraData(COMPANY_PROFILE, PROFILE);
        request.session?.setExtraData(NEW_EMAIL_ADDRESS, EMAIL_ADDRESS);

        mockPostRegisteredEmailAddress.mockRejectedValue(new Error("anything"));
        await checkAnswerHandler.post(request, response).catch((data) => {
          expect(data.statementError).toEqual("Failed to create Registered Email Address Resource for company 12345678");
        });
      });

      it("Should handle failure on close transaction", async () => {
        request.body.emailConfirmation = "anything";
        request.session?.setExtraData(COMPANY_PROFILE, PROFILE);
        request.session?.setExtraData(NEW_EMAIL_ADDRESS, EMAIL_ADDRESS);

        mockPostRegisteredEmailAddress.mockResolvedValue("anything");
        mockCloseTransaction.mockRejectedValue(new Error("anything"));
        await checkAnswerHandler.post(request, response).catch((data) => {
          expect(data.statementError).toEqual("Unable to close a transaction record for company 12345678");
        });
      });

      it("Successfully create registered email address resource", async () => {
        request.body.emailConfirmation = "anything";
        request.session?.setExtraData(COMPANY_PROFILE, PROFILE);
        request.session?.setExtraData(NEW_EMAIL_ADDRESS, EMAIL_ADDRESS);
        request.session?.setExtraData(SUBMISSION_ID, TRANSACTION_ID);

        mockPostRegisteredEmailAddress.mockResolvedValue("anything");
        mockCloseTransaction.mockResolvedValue("anything");
        await checkAnswerHandler.post(request, response).then((data) => {
          expect(data.sessionID).toEqual(TRANSACTION_ID);
        });
      });
    });
  });
});
