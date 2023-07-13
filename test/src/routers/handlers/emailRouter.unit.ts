import mocks from "../../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../../src/app";
import {CHECK_YOUR_ANSWERS_URL} from "../../../../src/config/index";
import {handleGetCheckRequest, handlePostCheckRequest} from "../../../../src/routers/handlers/email/confirmEmailChange";

jest.mock("../../../../src/routers/handlers/email/confirmEmailChange");

const mockHandleGetCheckRequest = handleGetCheckRequest  as jest.Mock;
const mockHandlePostCheckRequest = handlePostCheckRequest as jest.Mock;

describe("Confirm email router tests", () => {
    const PAGE_HEADING = "Update a registered email address";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Should navigate to confirm email page", async () => {
        mockHandleGetCheckRequest.mockReturnValueOnce({newEmailAddress: "test@test.com"});

        const response = await request(app)
            .get(CHECK_YOUR_ANSWERS_URL);

        expect(response.text).toContain(PAGE_HEADING);
        expect(response.status).toBe(200);
        expect(mockHandleGetCheckRequest).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("Should re-display check answer page when not confirmed", async () => {
        // mockHandlePostCheckRequest.mockReturnValueOnce({statementError: "You need to accept the registered email address statement"});

        const response = await request(app)
            .post(CHECK_YOUR_ANSWERS_URL);

        expect(response.text).toContain("There is a problem with the details you gave us");
        expect(response.text).toContain("You need to accept the registered email address statement");
        expect(response.status).toBe(200);
        expect(mockHandlePostCheckRequest).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("Should navigate to update submitted page", async () => {
        mockHandlePostCheckRequest.mockReturnValueOnce({emailConfirmation: "confirm"});

        const response = await request(app)
            .post(CHECK_YOUR_ANSWERS_URL);

        expect(response.text).toContain("Registered email address update submitted");
        expect(response.status).toBe(200);
        expect(mockHandlePostCheckRequest).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });
});

