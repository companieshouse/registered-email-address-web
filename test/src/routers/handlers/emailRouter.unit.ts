import mocks from "../../../mocks/all.middleware.mock";
import request from "supertest";
import * as rea from '../../../../src/services/company/createRegisteredEmailAddressResource';
import * as transactions from '../../../../src/services/transaction/transaction.service';
import app from "../../../../src/app";
import {CHECK_YOUR_ANSWERS_URL} from "../../../../src/config";
import {HttpResponse} from "@companieshouse/api-sdk-node/dist/http/http-client";
import {StatusCodes} from "http-status-codes";
import {ConfirmCompanyHandler} from "../../../../src/routers/handlers/company/confirm";

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
        const getSpy = jest.spyOn(ConfirmCompanyHandler.prototype, 'get').mockResolvedValue(okResponse);

        const response = await request(app)
            .get(CHECK_YOUR_ANSWERS_URL);

        expect(response.text).toContain(PAGE_HEADING);
        expect(response.status).toBe(200);
        expect(getSpy).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("Should re-display check answer page when Email not confirmed", async () => {
        const response = await request(app)
            .post(CHECK_YOUR_ANSWERS_URL);

        expect(response.text).toContain("You need to accept the registered email address statement");
        expect(response.status).toBe(200);
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("Should navigate to update submitted page when Email confirmed", async () => {
        const createReaSpy = jest.spyOn(rea, 'createRegisteredEmailAddressResource').mockResolvedValue(clone(createdResponse));
        const transactionsSpy = jest.spyOn(transactions, 'closeTransaction').mockResolvedValue(clone(noContentResponse));

        const response = await request(app)
            .post(CHECK_YOUR_ANSWERS_URL)
            .send({emailConfirmation: 'anything'});

        expect(response.text).toContain("Registered email address update submitted");
        expect(response.status).toBe(200);
        expect(createReaSpy).toHaveBeenCalled();
        expect(transactionsSpy).toHaveBeenCalled();
    });
});

