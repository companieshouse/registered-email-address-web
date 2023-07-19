import mocks from "../../../../mocks/all.middleware.mock";
import request from "supertest";
import * as rea from '../../../../../src/services/email/createRegisteredEmailAddressResource';
import * as transactions from '../../../../../src/services/transaction/transaction.service';
import app from "../../../../../src/app";
import {EMAIL_CHECK_ANSWER_URL, EMAIL_UPDATE_SUBMITTED_URL} from "../../../../../src/config";
import {HttpResponse} from "@companieshouse/api-sdk-node/dist/http/http-client";
import {StatusCodes} from "http-status-codes";
import {CheckAnswerHandler} from "../../../../../src/routers/handlers/email/checkAnswer";

const createdResponse: HttpResponse = {status: StatusCodes.CREATED};
const noContentResponse: HttpResponse = {status: StatusCodes.NO_CONTENT};
const okResponse: HttpResponse = {status: StatusCodes.OK};

const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Confirm email router tests", () => {
  const PAGE_HEADING = "Update a registered email address";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should navigate to confirm email page", async () => {
    const getSpy = jest.spyOn(CheckAnswerHandler.prototype, 'get').mockResolvedValue(okResponse);

    await request(app)
      .get(EMAIL_CHECK_ANSWER_URL)
      .then((response) => {
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.status).toBe(200);
        expect(getSpy).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
      });
  });

  it("Should re-display check answer page when Email not confirmed", async () => {
    await request(app)
      .post(EMAIL_CHECK_ANSWER_URL)
      .then((response) => {
        expect(response.text).toContain("You need to accept the registered email address statement");
        expect(response.status).toBe(200);
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
      });
  });

  it("Should navigate to update submitted page when Email confirmed", async () => {
    const createSpy = jest.spyOn(rea, 'createRegisteredEmailAddressResource').mockResolvedValue(clone(createdResponse));
    const transSpy = jest.spyOn(transactions, 'closeTransaction').mockResolvedValue(clone(noContentResponse));

    await request(app)
      .post(EMAIL_CHECK_ANSWER_URL)
      .send({emailConfirmation: 'anything'})
      .then((response) => {
        expect(response.text).toContain(EMAIL_UPDATE_SUBMITTED_URL);
        expect(response.status).toBe(StatusCodes.MOVED_TEMPORARILY);
        expect(createSpy).toHaveBeenCalled();
        expect(transSpy).toHaveBeenCalled();
      });
  });
});

