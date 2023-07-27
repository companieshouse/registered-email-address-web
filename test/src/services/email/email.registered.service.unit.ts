import {postRegisteredEmailAddress} from "../../../../src/services/email/email.registered.service";
import {RegisteredEmailAddress} from "@companieshouse/api-sdk-node/dist/services/registered-email-address/types";
import {Resource} from "@companieshouse/api-sdk-node";
import {StatusCodes} from "http-status-codes";
import {Session} from "@companieshouse/node-session-handler";
import {createPublicOAuthApiClient} from "../../../../src/services/api/api.service";

jest.mock("../../../../src/services/api/api.service");
jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../../src/utils/common/Logger");

let session: any;

const mockCreatePublicOAuthApiClient = createPublicOAuthApiClient as jest.Mock;
const mockPostTransaction = jest.fn();

mockCreatePublicOAuthApiClient.mockReturnValue({
    registeredEmailAddressService: {
        postRegisteredEmailAddress: mockPostTransaction
    }
});

describe("Registered Email service test", () => {
    const COMPANY_NUMBER = "1234567";
    const TRANSACTION_ID = "178417-909116-690426";
    const EMAIL_ADDRESS_TO_REGISTER = "test@test.com";

    beforeEach(() => {
        jest.clearAllMocks();
        session = new Session;
    });

    describe("postRegisteredEmailAddress tests", () => {
        it("Should successfully post a registered email address", async () => {
            mockPostTransaction.mockResolvedValueOnce({
                httpStatusCode: StatusCodes.CREATED,
                resource: {
                    registeredEmailAddress: EMAIL_ADDRESS_TO_REGISTER
                }
            });

            await postRegisteredEmailAddress(session, TRANSACTION_ID, COMPANY_NUMBER, EMAIL_ADDRESS_TO_REGISTER).then((data) => {
                expect(data.httpStatusCode).toEqual(StatusCodes.CREATED);
                const castedData: Resource<RegisteredEmailAddress> = data as Resource<RegisteredEmailAddress>;
                expect(castedData?.resource?.registeredEmailAddress).toEqual(EMAIL_ADDRESS_TO_REGISTER);
            });
        });

        it("Should throw an error when no registered email api response", async () => {
            mockPostTransaction.mockResolvedValueOnce(undefined);

            await expect(postRegisteredEmailAddress(session, TRANSACTION_ID, COMPANY_NUMBER, EMAIL_ADDRESS_TO_REGISTER))
                .rejects.toBe(undefined);
        });

        it("Should throw an error if SERVICE UNAVAILABLE returned from SDK", async () => {
            mockPostTransaction.mockResolvedValueOnce({
                httpStatusCode: StatusCodes.SERVICE_UNAVAILABLE
            } as Resource<RegisteredEmailAddress>);

            await expect(postRegisteredEmailAddress(session, TRANSACTION_ID, COMPANY_NUMBER, EMAIL_ADDRESS_TO_REGISTER))
                .rejects.toEqual({"httpStatusCode": 503});
        });

        it("Should throw an error if no response resource returned from SDK", async () => {
            mockPostTransaction.mockResolvedValueOnce({
                httpStatusCode: StatusCodes.CREATED
            });

            await expect(postRegisteredEmailAddress(session, TRANSACTION_ID, COMPANY_NUMBER, EMAIL_ADDRESS_TO_REGISTER))
                .rejects.toEqual({httpStatusCode: StatusCodes.CREATED});
        });
    });
});
