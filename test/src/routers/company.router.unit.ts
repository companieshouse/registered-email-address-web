import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import {
  COMPANY_CONFIRM_URL,
  EMAIL_CHANGE_EMAIL_ADDRESS_URL,
  INVALID_COMPANY_URL,
  THERE_IS_A_PROBLEM_URL
} from "../../../src/config";
import {StatusCodes} from "http-status-codes";
import {HttpResponse} from "@companieshouse/api-sdk-node/dist/http/http-client";
import {INVALID_COMPANY_NUMBER} from "../../../src/constants/app.const";
import {InvalidCompanyHandler} from "../../../src/routers/handlers/company/invalid.company";
import {ConfirmCompanyHandler} from "../../../src/routers/handlers/company/confirm";
import {
  INVALID_COMPANY_SERVICE_UNAVAILABLE,
  INVALID_COMPANY_TYPE_REASON
} from "../../../src/constants/validation.const";


const okResponse: HttpResponse = {status: StatusCodes.OK};


describe("Company router tests -", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Confirm Company Page tests -", () => {
    const PAGE_TITLE = "Confirm this is the correct company – Update a registered email address – GOV.UK";
    const ERROR_PAGE_TITLE = "What is the company number? – Update a registered email address – GOV.UK";


    it("Get Request to confirm URL should render company confirmation Page", async () => {
      const getSpy = jest.spyOn(ConfirmCompanyHandler.prototype, 'get')
        .mockResolvedValue({title : "Confirm this is the correct company", companyProfile : {companyNumber: 12345678}});

      await request(app)
        .get(COMPANY_CONFIRM_URL)
        .then((response) => {
          expect(response.text).toContain(PAGE_TITLE);
          expect(response.status).toBe(StatusCodes.OK);
          expect(getSpy).toHaveBeenCalled();
          expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        });
    });

    it("Get Request to confirm URL should Error", async () => {
      const getSpy = jest.spyOn(ConfirmCompanyHandler.prototype, 'get')
        .mockResolvedValue({title : "What is the company number?", errors : {companyNumber : INVALID_COMPANY_NUMBER }});

      await request(app)
        .get(COMPANY_CONFIRM_URL)
        .then((response) => {
          expect(response.text).toContain(ERROR_PAGE_TITLE);
          expect(response.status).toBe(StatusCodes.OK);
          expect(getSpy).toHaveBeenCalled();
          expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        });
    });

    it("Post Request to confirm URL should redirect to email change address", async () => {
      const getSpy = jest.spyOn(ConfirmCompanyHandler.prototype, 'post')
        .mockResolvedValue({companyProfile : {companyNumber: 12345678}});
      await request(app)
        .post(COMPANY_CONFIRM_URL)
        .then((response) => {
          expect(response.text).toContain(EMAIL_CHANGE_EMAIL_ADDRESS_URL);
          expect(response.status).toBe(StatusCodes.MOVED_TEMPORARILY);
          expect(getSpy).toHaveBeenCalled();
          expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        });
    });

    it("Post Request to confirm URL should redirect to Service unavailable", async () => {
      const getSpy = jest.spyOn(ConfirmCompanyHandler.prototype, 'post')
        .mockResolvedValue({invalidCompanyReason : INVALID_COMPANY_SERVICE_UNAVAILABLE });
      await request(app)
        .post(COMPANY_CONFIRM_URL)
        .then((response) => {
          expect(response.text).toContain(THERE_IS_A_PROBLEM_URL);
          expect(response.status).toBe(StatusCodes.MOVED_TEMPORARILY);
          expect(getSpy).toHaveBeenCalled();
          expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        });
    });

    it("Post Request to confirm URL should redirect to Invalid company", async () => {
      const getSpy = jest.spyOn(ConfirmCompanyHandler.prototype, 'post')
        .mockResolvedValue({invalidCompanyReason : INVALID_COMPANY_TYPE_REASON });
      await request(app)
        .post(COMPANY_CONFIRM_URL)
        .then((response) => {
          expect(response.text).toContain(INVALID_COMPANY_URL);
          expect(response.status).toBe(StatusCodes.MOVED_TEMPORARILY);
          expect(getSpy).toHaveBeenCalled();
          expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        });
    });

  });

  describe("Invalid Page tests -", () => {
    const PAGE_TITLE = "Invalid Company – Update a registered email address – GOV.UK";

    it("Get Request to invalid URL should render company invalid Page", async () => {
      const getSpy = jest.spyOn(InvalidCompanyHandler.prototype, 'get').mockResolvedValue({title : "Invalid Company"});
      await request(app)
        .get(INVALID_COMPANY_URL)
        .then((response) => {
          expect(response.text).toContain(PAGE_TITLE);
          expect(response.status).toBe(StatusCodes.OK);
          expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        });
    });

  });
});
