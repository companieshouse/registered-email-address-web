import "reflect-metadata";
import { Request, Response } from "express";
import { createRequest, createResponse, MockRequest, MockResponse } from 'node-mocks-http';
import { UpdateSubmittedHandler } from "../../../../../src/routers/handlers/email/updateSubmitted";
import { Session } from "@companieshouse/node-session-handler";
import { createSessionData } from "../../../../mocks/sessionGenerator.mock";
import { SUBMISSION_ID } from "../../../../../src/constants/app.const";
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
  it("Required submission data in object returned from handler", async () => {
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
    });
  });
});

export function generateRandomBytesBase64(numBytes: number): string {
  return crypto.randomBytes(numBytes).toString("base64");
}
