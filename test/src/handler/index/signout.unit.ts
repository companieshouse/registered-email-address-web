jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../../src/services/api/api.service");
jest.mock("../../../../src/lib/Logger");

import "reflect-metadata";
import { Request, Response } from "express";
import { createRequest, createResponse, MockRequest, MockResponse } from 'node-mocks-http';
import { SignOutHandler } from "../../../../src/routers/handlers/index/signout";
import { Session } from "@companieshouse/node-session-handler";
import { createAndLogError } from "../../../../src/lib/Logger";
import {RETURN_URL} from "../../../../src/constants/app.const";

const TEST_BACK_LINK =  "test/any";


// default handler instance
let signOutHandler: SignOutHandler;

// mocking block - logging
const mockCreateAndLogError = createAndLogError as jest.Mock;
mockCreateAndLogError.mockReturnValue(new Error());

// request/response/session
let session: Session;
let request: MockRequest<Request>;
let response: MockResponse<Response>;

// clone response processor
const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Test ConfirmCompanyHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    signOutHandler = new SignOutHandler();
    // session instance
    session = new Session();
    // mock request/responses
    request = createRequest({
      session: session,
      headers : {
        referer :  TEST_BACK_LINK
      }
    });    
    response = createResponse();

  });

  it("GET signout page - Get signout page", async () => {
    //set Company Profile in session
    await signOutHandler.get(request, response).then((response) => {
      const responseJson = JSON.parse(JSON.stringify(response));
      expect(responseJson.backUri).toEqual(TEST_BACK_LINK);
      expect(responseJson.signoutBanner).toBeTruthy();

    });
  });

  it("Default signout page - no radio button selection, show noInputSelectedError ", async () => {
    //set Company Profile in session
    session.setExtraData(RETURN_URL, TEST_BACK_LINK);
    await signOutHandler.default(request, response).then((response) => {
      const responseJson = JSON.parse(JSON.stringify(response));
      expect(responseJson.backUri).toEqual(TEST_BACK_LINK);
      expect(responseJson.noInputSelectedError).toBeTruthy();
      expect(responseJson.signoutBanner).toBeTruthy();
    });
  });

  it("Default signout page - no radio button selection, show error ", async () => {
    //set Company Profile in session
    session.setExtraData(RETURN_URL, TEST_BACK_LINK);
    await signOutHandler.default(request, response).then((response) => {
      const responseJson = JSON.parse(JSON.stringify(response));
      expect(responseJson.backUri).toEqual(TEST_BACK_LINK);
      expect(responseJson.noInputSelectedError).toBeTruthy();
      expect(responseJson.signoutBanner).toBeTruthy();
    });
  });

  it("Default signout page - no radio button selection, and no back link provided in session throw error ", async () => {
    //set Company Profile in session
    expect( () =>  signOutHandler.default(request, response))
      .toThrow(new Error(`Cannot find url of page to return user to.`));

  
  });



});
