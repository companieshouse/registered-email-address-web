import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import {COMPANY_CONFIRM_URL, COMPANY_NUMBER_URL, EMAIL_CHANGE_EMAIL_ADDRESS_URL, INVALID_COMPANY_URL} from "../../../src/config";
import {StatusCodes} from "http-status-codes";
import {CompanySearchHandler} from "../../../src/routers/handlers/company/companySearch";
import {HttpResponse} from "@companieshouse/api-sdk-node/dist/http/http-client";
import {INVALID_COMPANY_NUMBER} from "../../../src/constants/app.const";
import {InvalidCompanyHandler} from "../../../src/routers/handlers/company/invalidCompany";
import {ConfirmCompanyHandler} from "../../../src/routers/handlers/company/confirm";
import {INVALID_COMPANY_TYPE_REASON} from "../../../src/constants/validation.const";


const okResponse: HttpResponse = {status: StatusCodes.OK};


describe("Company router tests -", () => {
  const ERROR_HEADING = "There is a problem with the details you gave us";
  const COMPANY_NUMBER_PAGE_TITLE = "What is the company number? – Update a registered email address – GOV.UK";


  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Company Number Page tests -", () => {
    it("Get Request to company Number URL should company search Page", async () => {
      await request(app)
        .get(COMPANY_NUMBER_URL)
        .then((response) => {
          expect(response.text).toContain(COMPANY_NUMBER_PAGE_TITLE);
          expect(response.status).toBe(StatusCodes.OK);
          expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        });
    });

    it("Post Request to company Number URL should redirect to confirm page", async () => {
      const getSpy = jest.spyOn(CompanySearchHandler.prototype, 'post').mockResolvedValue(okResponse);

      await request(app)
        .post(COMPANY_NUMBER_URL)
        .send({companyNumber : '12345678'})
        .then((response) => {
          expect(response.text).toContain(COMPANY_CONFIRM_URL);
          expect(response.status).toBe(StatusCodes.MOVED_TEMPORARILY);
          expect(getSpy).toHaveBeenCalled();
        });
    });

    it("Post Request to company Number URL should ERROR", async () => {
      const getSpy = jest.spyOn(CompanySearchHandler.prototype, 'post')
        .mockResolvedValue( {errors : {companyNumber : INVALID_COMPANY_NUMBER }});

      await request(app)
        .post(COMPANY_NUMBER_URL)
        .send({companyNumber : '12345678'})
        .then((response) => {
          expect(response.text).toContain(COMPANY_NUMBER_PAGE_TITLE);
          expect(response.text).toContain(ERROR_HEADING);
          expect(response.status).toBe(StatusCodes.OK);
          expect(getSpy).toHaveBeenCalled();
          expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        });
    });
  });

  describe("Confirm Company Page tests -", () => {
    const PAGE_TITLE = "Confirm this is the correct company – Update a registered email address – GOV.UK";

    it("Get Request to confirm URL should render company search Page", async () => {
      const getSpy = jest.spyOn(ConfirmCompanyHandler.prototype, 'get')
        .mockResolvedValue({companyProfile : {companyNumber: 12345678}});

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
        .mockResolvedValue({errors : {companyNumber : INVALID_COMPANY_NUMBER }});

      await request(app)
        .get(COMPANY_CONFIRM_URL)
        .then((response) => {
          expect(response.text).toContain(COMPANY_NUMBER_PAGE_TITLE);
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
      const getSpy = jest.spyOn(InvalidCompanyHandler.prototype, 'get').mockResolvedValue({});
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
