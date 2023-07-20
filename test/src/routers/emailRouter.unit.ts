import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import {
  EMAIL_CHANGE_EMAIL_ADDRESS_URL,
  EMAIL_CHECK_ANSWER_URL,
  EMAIL_UPDATE_SUBMITTED_URL
} from "../../../src/config";
import {HttpResponse} from "@companieshouse/api-sdk-node/dist/http/http-client";
import {StatusCodes} from "http-status-codes";
import {CheckAnswerHandler} from "../../../src/routers/handlers/email/checkAnswer";
import {ChangeEmailAddressHandler} from "../../../src/routers/handlers/email/changeEmailAddress";
import {UpdateSubmittedHandler} from "../../../src/routers/handlers/email/updateSubmitted";

const okResponse: HttpResponse = {status: StatusCodes.OK};
const movedTemporarilyResponse: HttpResponse = {status: StatusCodes.MOVED_TEMPORARILY};

const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Email router tests", () => {
  const COMMON_PAGE_HEADING = "Update a registered email address";

  describe("Confirm email router tests", () => {
    const PAGE_HEADING = "What is the new registered email address?";

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("Change email tests", () => {
      it("Should navigate to change email page", async () => {
        const getSpy = jest.spyOn(ChangeEmailAddressHandler.prototype, 'get').mockResolvedValue(clone(okResponse));

        await request(app)
          .get(EMAIL_CHANGE_EMAIL_ADDRESS_URL)
          .then((response) => {
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.text).toContain(COMMON_PAGE_HEADING);
            expect(response.text).toContain(PAGE_HEADING);
            expect(getSpy).toHaveBeenCalled();
            expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
          });
      });

      it("Should navigate back to there is a problem page if unexpected data", async () => {
        const errorObject = {errors: "anything"};
        const getSpy = jest.spyOn(ChangeEmailAddressHandler.prototype, 'get').mockRejectedValue(errorObject);

        await request(app)
          .get(EMAIL_CHANGE_EMAIL_ADDRESS_URL)
          .then((response) => {
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.text).toContain(COMMON_PAGE_HEADING);
            expect(response.text).toContain("there is a problem");
            expect(getSpy).toHaveBeenCalled();
            expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
          });
      });

      it("Should re-display change email page when Email not entered", async () => {
        const errorObject = {errors: {changeEmailAddress: "You need to accept the registered email address statement"}};
        const postSpy = jest.spyOn(ChangeEmailAddressHandler.prototype, 'post').mockRejectedValue(errorObject);

        await request(app)
          .post(EMAIL_CHANGE_EMAIL_ADDRESS_URL)
          .send({changeEmailAddress: ""})
          .then((response) => {
            expect(response.text).toContain(COMMON_PAGE_HEADING);
            expect(response.text).toContain(PAGE_HEADING);
            expect(response.text).toContain("You need to accept the registered email address statement");
            expect(postSpy).toHaveBeenCalled();
            expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
          });
      });

      it("Should navigate to check your answer page when valid Email entered", async () => {
        const postSpy = jest.spyOn(ChangeEmailAddressHandler.prototype, 'post').mockResolvedValue(movedTemporarilyResponse);

        await request(app)
          .post(EMAIL_CHANGE_EMAIL_ADDRESS_URL)
          .then((response) => {
            expect(response.status).toBe(302);
            expect(response.text).toContain("Redirecting to /registered-email-address/email/check-your-answer");
            expect(postSpy).toHaveBeenCalled();
          });
      });
    });

    describe("Check your answer tests", () => {
      const PAGE_HEADING = "Check your answer before sending your application";

      it("Should navigate to confirm email page", async () => {
        const getSpy = jest.spyOn(CheckAnswerHandler.prototype, 'get').mockResolvedValue(clone(okResponse));

        await request(app)
          .get(EMAIL_CHECK_ANSWER_URL)
          .then((response) => {
            expect(response.status).toBe(200);
            expect(response.text).toContain(COMMON_PAGE_HEADING);
            expect(response.text).toContain(PAGE_HEADING);
            expect(getSpy).toHaveBeenCalled();
            expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
          });
      });

      it("Should re-display check answer page when Email change unconfirmed", async () => {
        const errorObject = {statementError: "You need to accept the registered email address statement"};
        const postSpy = jest.spyOn(CheckAnswerHandler.prototype, 'post').mockRejectedValue(errorObject);

        await request(app)
          .post(EMAIL_CHECK_ANSWER_URL)
          .then((response) => {
            expect(response.text).toContain(COMMON_PAGE_HEADING);
            expect(response.text).toContain(PAGE_HEADING);
            expect(response.text).toContain("You need to accept the registered email address statement");
            expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
            expect(postSpy).toHaveBeenCalled();
          });
      });

      it("Should fail gracefully on unexpected errors", async () => {
        const errorObject = {errors: "anything"};
        const postSpy = jest.spyOn(CheckAnswerHandler.prototype, 'post').mockRejectedValue(errorObject);

        await request(app)
          .post(EMAIL_CHECK_ANSWER_URL)
          .send({emailConfirmation: 'anything'})
          .then((response) => {
            expect(response.text).toContain(COMMON_PAGE_HEADING);
            expect(response.text).toContain(PAGE_HEADING);
            expect(response.text).toContain("There is a problem with the details you gave us");
            expect(postSpy).toHaveBeenCalled();
          });
      });

      it("Should navigate to update submitted page when Email confirmed", async () => {
        const postSpy = jest.spyOn(CheckAnswerHandler.prototype, 'post').mockResolvedValue(okResponse);

        await request(app)
          .post(EMAIL_CHECK_ANSWER_URL)
          .send({emailConfirmation: 'anything'})
          .then((response) => {
            expect(response.status).toBe(StatusCodes.MOVED_TEMPORARILY);
            expect(response.text).toContain(EMAIL_UPDATE_SUBMITTED_URL);
            expect(postSpy).toHaveBeenCalled();
          });
      });
    });
  });

  describe("Update submitted tests", () => {
    const PAGE_HEADING = "Application submitted – Update a registered email address";

    it("Should navigate to update submitted page", async () => {
      const getSpy = jest.spyOn(UpdateSubmittedHandler.prototype, 'get').mockResolvedValue(clone(okResponse));

      await request(app)
        .get(EMAIL_UPDATE_SUBMITTED_URL)
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.text).toContain(PAGE_HEADING);
          expect(getSpy).toHaveBeenCalled();
          expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        });
    });
  });
});

