jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../../src/services/api/api.service");
jest.mock("../../../../src/lib/Logger");

import { Session } from "@companieshouse/node-session-handler";
import { createPublicOAuthApiClient } from "../../../../src/services/api/api.service";
import { closeTransaction, postTransaction, putTransaction } from "../../../../src/services/transaction/transaction.service";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { createAndLogError } from "../../../../src/lib/Logger";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { REFERENCE } from "../../../../src/config/index";
import { StatusCodes } from 'http-status-codes';

const mockCreatePublicOAuthApiClient = createPublicOAuthApiClient as jest.Mock;
const mockPostTransaction = jest.fn();
const mockPutTransaction = jest.fn();
const mockGetTransaction = jest.fn();
const mockCreateAndLogError = createAndLogError as jest.Mock;

mockCreatePublicOAuthApiClient.mockReturnValue({
  transaction: {
    getTransaction: mockGetTransaction,
    postTransaction: mockPostTransaction,
    putTransaction: mockPutTransaction
  }
});

const ERROR: Error = new Error("oops");
mockCreateAndLogError.mockReturnValue(ERROR);

let session: any;
const TRANSACTION_ID = "2222";
const COMPANY_NUMBER = "12345678";
const EXPECTED_REF = REFERENCE;

describe("transaction service tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    session = new Session;
  });

  describe("postTransaction tests", () => {
    it("Should successfully post a transaction", async() => {
      mockPostTransaction.mockResolvedValueOnce({
        httpStatusCode: StatusCodes.OK,
        resource: {
          reference: "ref",
          companyNumber: COMPANY_NUMBER,
          description: "desc"
        }
      });
      const transaction: Transaction = await postTransaction(session, COMPANY_NUMBER, "desc", "ref");

      expect(transaction.reference).toEqual("ref");
      expect(transaction.companyNumber).toEqual(COMPANY_NUMBER);
      expect(transaction.description).toEqual("desc");
    });

    it("Should throw an error when no transaction api response", async () => {
      mockPostTransaction.mockResolvedValueOnce(undefined);

      await expect(postTransaction(session, COMPANY_NUMBER, "desc", "ref")).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith("Transaction API POST request returned no response for company number 12345678");
    });

    it("Should throw an error when transaction api returns a status greater than 400", async () => {
      mockPostTransaction.mockResolvedValueOnce({
        httpStatusCode: StatusCodes.NOT_FOUND
      });

      await expect(postTransaction(session, COMPANY_NUMBER, "desc", "ref")).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith(`Http status code ${StatusCodes.NOT_FOUND} - Failed to post transaction for company number 12345678`);
    });

    it("Should throw an error when transaction api returns no resource", async () => {
      mockPostTransaction.mockResolvedValueOnce({
        httpStatusCode: StatusCodes.OK
      });

      await expect(postTransaction(session, COMPANY_NUMBER, "desc", "ref")).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith("Transaction API POST request returned no resource for company number 12345678");
    });
  });


  describe("putTransaction tests", () => {
    it("Should successfully PUT a transaction", async () => {
      mockPutTransaction.mockResolvedValueOnce({
        headers: {
          "X-Payment-Required": "http://payment"
        },
        httpStatusCode: StatusCodes.OK,
        resource: {
          reference: EXPECTED_REF,
          companyNumber: COMPANY_NUMBER,
          description: "desc",
          status: "closed"
        }
      } as ApiResponse<Transaction>);
      const transaction: ApiResponse<Transaction> = await putTransaction(session, COMPANY_NUMBER, TRANSACTION_ID, "desc", "closed");

      expect(transaction.resource?.reference).toEqual(EXPECTED_REF);
      expect(transaction.resource?.companyNumber).toEqual(COMPANY_NUMBER);
      expect(transaction.resource?.description).toEqual("desc");
      expect(transaction.resource?.status).toEqual("closed");

      expect(mockPutTransaction.mock.calls[0][0].status).toBe("closed");
      expect(mockPutTransaction.mock.calls[0][0].id).toBe(TRANSACTION_ID);
      expect(mockPutTransaction.mock.calls[0][0].reference).toBe(EXPECTED_REF);
    });

    it("Should throw an error when no transaction api response", async () => {
      mockPutTransaction.mockResolvedValueOnce(undefined);

      await expect(putTransaction(session, COMPANY_NUMBER, TRANSACTION_ID, "desc", "closed")).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith(`Transaction API PUT request returned no response for transaction id ${TRANSACTION_ID}, company number ${COMPANY_NUMBER}`);
    });

    it("Should throw an error when transaction api returns a status greater than 400", async () => {
      mockPutTransaction.mockResolvedValueOnce({
        httpStatusCode: StatusCodes.NOT_FOUND
      });

      await expect(putTransaction(session, COMPANY_NUMBER, TRANSACTION_ID, "desc", "closed")).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith(`Http status code ${StatusCodes.NOT_FOUND} - Failed to put transaction for transaction id ${TRANSACTION_ID}, company number ${COMPANY_NUMBER}`);
    });
  });

  describe("closeTransaction tests", () => {
    it("Expected data should exist in close transaction response", async () => {
      const apiResponse = `"httpStatusCode": ${StatusCodes.OK}, "resource": {"companyNumber": "12345678", "description": "desc", "reference": "UpdateRegisteredEmailAddressReference", "status": "closed"}}`;
      mockPutTransaction.mockResolvedValueOnce({
        httpStatusCode: StatusCodes.OK,
        resource: {
          reference: EXPECTED_REF,
          companyNumber: COMPANY_NUMBER,
          description: "desc",
          status: "closed"
        }
      } as ApiResponse<Transaction>);

      const expectedAPIResponse = await closeTransaction(session, COMPANY_NUMBER, TRANSACTION_ID);

      expect(expectedAPIResponse.httpStatusCode).toBe(StatusCodes.OK);
      expect(expectedAPIResponse.resource?.companyNumber).toBe(COMPANY_NUMBER);
      expect(expectedAPIResponse.resource?.reference).toBe(REFERENCE);
    });
  });
});
