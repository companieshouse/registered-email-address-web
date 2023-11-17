import "reflect-metadata";
import {Request, Response} from "express";
import {createRequest, createResponse, MockRequest, MockResponse} from 'node-mocks-http';
import {UpdateSubmittedHandler} from "../../../../../src/routers/handlers/email/update_submitted";
import {Session} from "@companieshouse/node-session-handler";
import {createSessionData} from "../../../../mocks/session_generator_mock";
import {RETURN_TO_CONFIRMATION_STATEMENT, SUBMISSION_ID} from "../../../../../src/constants/app_const";
import * as crypto from "crypto";

const TEST_USER_EMAIL: string = "test_user@test.co.biz";
const TEST_SUBMISSION_ID: string = "HSN8NS-92MSOS-91JSOS";
const cookieSecret = generateRandomBytesBase64(16);

// default handler instance
const updateSubmittedHandler: UpdateSubmittedHandler = new UpdateSubmittedHandler();

// request/response/session
let session: Session;
let request: MockRequest<Request>;
const response: MockResponse<Response> = createResponse();

describe("Registered email address update - test GET method", () => {
  it("Required submission data in object returned from handler - return to Confirmation Statement flag NOT set", async () => {
    // mock request/responses
    request = createRequest({
      session: new Session({
        ...createSessionData(cookieSecret)
      })
    });

    // set submission id in session
    request.session?.setExtraData(SUBMISSION_ID, TEST_SUBMISSION_ID);

    await updateSubmittedHandler.get(request, response).then((updateSubmittedResponse) => {
      const updateSubmittedResponseJson = JSON.parse(JSON.stringify(updateSubmittedResponse));

      expect(updateSubmittedResponseJson.userEmail).toEqual(TEST_USER_EMAIL);
      expect(updateSubmittedResponseJson.submissionID).toEqual(TEST_SUBMISSION_ID);
      expect(updateSubmittedResponseJson.registeredEmailAddressSubmitted).toBeUndefined();
    });
  });

  it("Required submission data in object returned from handler - return to Confirmation Statement flag set", async () => {
    // mock request/responses
    request = createRequest({
      session: new Session({
        ...createSessionData(cookieSecret)
      })
    });

    // set submission id in session
    request.session?.setExtraData(SUBMISSION_ID, TEST_SUBMISSION_ID);
    request.session?.setExtraData(RETURN_TO_CONFIRMATION_STATEMENT, true);

    await updateSubmittedHandler.get(request, response).then((updateSubmittedResponse) => {
      const updateSubmittedResponseJson = JSON.parse(JSON.stringify(updateSubmittedResponse));

      expect(updateSubmittedResponseJson.userEmail).toEqual(TEST_USER_EMAIL);
      expect(updateSubmittedResponseJson.submissionID).toEqual(TEST_SUBMISSION_ID);
      expect(updateSubmittedResponseJson.returnToConfirmationStatement).toEqual(true);
    });
  });

  it("Registered Email Address submitted flag not set when REA service not called from Confirmation Statement service", async () => {
    // mock request/responses
    request = createRequest({
      session: new Session({
        ...createSessionData(cookieSecret)
      })
    });

    // set submission id in session
    request.session?.setExtraData(SUBMISSION_ID, TEST_SUBMISSION_ID);

    await updateSubmittedHandler.post(request, response).then((updateSubmittedResponse) => {
      const updateSubmittedResponseJson = JSON.parse(JSON.stringify(updateSubmittedResponse));

      expect(updateSubmittedResponseJson.userEmail).toEqual(TEST_USER_EMAIL);
      expect(updateSubmittedResponseJson.submissionID).toEqual(TEST_SUBMISSION_ID);
      expect(updateSubmittedResponseJson.registeredEmailAddressSubmitted).toBeUndefined();
    });
  });

  it("Registered Email Address submitted flag set correctly when REA service called from Confirmation Statement service", async () => {
    // mock request/responses
    request = createRequest({
      session: new Session({
        ...createSessionData(cookieSecret)
      })
    });

    request.session?.setExtraData(RETURN_TO_CONFIRMATION_STATEMENT, true);

    await updateSubmittedHandler.post(request, response).then((updateSubmittedResponse) => {
      const registeredEmailAddressSubmitted: string | undefined = request.session?.getExtraData("registeredEmailAddressSubmitted");
      expect(registeredEmailAddressSubmitted).toEqual(true);
    });
  });

});

export function generateRandomBytesBase64(numBytes: number): string {
  return crypto.randomBytes(numBytes).toString("base64");
}
