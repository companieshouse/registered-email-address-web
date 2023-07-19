import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import {HOME_URL, COMPANY_NUMBER_URL, SIGN_OUT_URL, ACCOUNTS_SIGNOUT_PATH} from "../../../src/config";
import {StatusCodes} from "http-status-codes";
import {HomeHandler} from "../../../src/routers/handlers/index/home";
import {SignOutHandler} from "../../../src/routers/handlers/index/signout";

describe("Index router tests -", () => {
  const PAGE_HEADING = "Update a registered email address";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Home Page tests -", () => {

    it("Get Request to Home URL should Render Home Page", async () => {
      const getSpy = jest.spyOn(HomeHandler.prototype, 'get');

      await request(app)
        .get(HOME_URL)
        .then((response) => {
          expect(response.text).toContain(PAGE_HEADING);
          expect(response.status).toBe(StatusCodes.OK);
          expect(getSpy).toHaveBeenCalled();
          expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalledTimes(0);
        });
    });

    it("POST request to Home URL redirects to Company Number URL", async () => {
      await request(app)
        .post(HOME_URL)
        .then((response) => {
          expect(response.text).toContain(COMPANY_NUMBER_URL);
          expect(response.status).toBe(StatusCodes.MOVED_TEMPORARILY);
          expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalledTimes(0);
        });
    });

  });

  describe("signout tests -", () => {
    const PAGE_HEADING = "Are you sure you want to sign out? - Update a registered email address – GOV.UK";
    const ERROR_HEADING = "There is a problem";
    const URL = "test/return-url";

    it("GET request to signout url", async () => {
      const getSpy = jest.spyOn(SignOutHandler.prototype, 'get');

      await request(app)
        .get( SIGN_OUT_URL)
        .then((response) => {
          expect(response.text).toContain(PAGE_HEADING);
          expect(response.status).toBe(StatusCodes.OK);
          expect(getSpy).toHaveBeenCalled();
          expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();

        });
    });

    it("POST request to signout yes", async () => {
      const getSpy = jest.spyOn(SignOutHandler.prototype, 'get');
      await request(app)
        .post( SIGN_OUT_URL)
        .send({signout : 'yes'})
        .then((response) => {
          expect(response.text).toContain(ACCOUNTS_SIGNOUT_PATH);
          expect(response.status).toBe(StatusCodes.MOVED_TEMPORARILY);
          expect(getSpy).toHaveBeenCalledTimes(0);
          expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        });
    });

    it("POST request to signout no ", async () => {
      const getSpy = jest.spyOn(SignOutHandler.prototype, 'get');
      await request(app)
        .post( SIGN_OUT_URL)
        .send({signout : 'no'})
        .then((response) => {
          expect(response.text).toContain(URL);
          expect(response.status).toBe(StatusCodes.MOVED_TEMPORARILY);
          expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
          expect(mocks.mockSessionMiddleware).toHaveBeenCalled();

        });
    });

    it("POST request to signout default ", async () => {
      const getSpy = jest.spyOn(SignOutHandler.prototype, 'default');
      await request(app)
        .post( SIGN_OUT_URL)
        .then((response) => {
          expect(response.text).toContain(PAGE_HEADING);
          expect(response.text).toContain(ERROR_HEADING);
          expect(response.status).toBe(StatusCodes.OK);
          expect(getSpy).toHaveBeenCalled();
          expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
          expect(mocks.mockSessionMiddleware).toHaveBeenCalled();

        });
    });


  });
});
