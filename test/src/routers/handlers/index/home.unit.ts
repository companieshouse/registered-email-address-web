jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../../../src/services/api/api_service");
jest.mock("../../../../../src/utils/common/Logger");

import "reflect-metadata";
import { Request, Response } from "express";
import { createRequest, createResponse, MockRequest, MockResponse } from 'node-mocks-http';
import { HomeHandler } from "../../../../../src/routers/handlers/index/home";
import { Session } from "@companieshouse/node-session-handler";
import { createAndLogError } from "../../../../../src/utils/common/logger";

// default handler instance
let homeHandler: HomeHandler;

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
    homeHandler = new HomeHandler();
    // session instance
    session = new Session();
    // mock request/responses
    request = createRequest({
      session: session
    });
    response = createResponse();
  });

  it("GET request to serve home page - Get home page", async () => {
    //set Company Profile in session
    await homeHandler.get(request, response).then((homeResponse) => {
      const homeResponseJson = JSON.parse(JSON.stringify(homeResponse));
      expect(homeResponseJson.title).toEqual("Start");
      expect(homeResponseJson.signoutBanner).toEqual(false);

    });
  });


});
