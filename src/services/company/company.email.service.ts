import {companyEmail, companyEmailResource} from "./resources/resources";
import {createApiClient, Resource} from "@companieshouse/api-sdk-node";
import {
  CHS_API_KEY, DESCRIPTION,
  EMAIL_CHANGE_EMAIL_ADDRESS_URL,
  EMAIL_CHECK_ANSWER_URL,
  ORACLE_QUERY_API_URL, REFERENCE, transactionStatuses, urlParams
} from "../../config/index";
import {StatusCodes} from 'http-status-codes';
import {Request} from "express";
import {Session} from "@companieshouse/node-session-handler";
import {
  COMPANY_EMAIL,
  COMPANY_NUMBER,
  SUBMISSION_ID, TRANSACTION_CLOSE_ERROR,
  TRANSACTION_CREATE_ERROR,
  UPDATED_COMPANY_EMAIL
} from "../../constants/app.const";
import {createAndLogError, logger} from "../../lib/Logger";
import {ApiErrorResponse, ApiResponse} from "@companieshouse/api-sdk-node/dist/services/resource";
import {Transaction} from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import {createPublicApiKeyClient, createPublicOAuthApiClient} from "../api/api.service";
import {createTransaction} from "../../routers/handlers/email/changeEmailAddress";
import {closeTransaction, putTransaction} from "../transaction/transaction.service";


/**
 * Get the registered email address for a company.
 *
 * @param companyNumber the company number to look up
 */
export const getCompanyEmail = async (companyNumber: string): Promise<Resource<companyEmail>> => {
  // build client object
  const client = createApiClient(
    CHS_API_KEY,
    undefined,
    ORACLE_QUERY_API_URL
  );
  const resp = await client.apiClient.httpGet(`/company/${companyNumber}/registered-email-address`);

  const emailResource: Resource<companyEmail> = {
    httpStatusCode: resp.status
  };

  // return error response code if one received
  if (resp.status >= StatusCodes.BAD_REQUEST) {
    return emailResource;
  }

  // cast response body to expected companyEmailResource type
  const body = resp.body as companyEmailResource;

  emailResource.resource = {
    companyEmail: body.registered_email_address
  };
  return emailResource;
};

export const processGetCheckRequest = async (req: Request): Promise<object> => {
  logger.info(`Return new email address stored in session`);

  const session: Session = req.session as Session;
  const updatedCompanyEmail: string | undefined = session.getExtraData(UPDATED_COMPANY_EMAIL);

  return {
    "updatedCompanyEmail": updatedCompanyEmail,
    backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
    signoutBanner: true,
    userEmail: req.session?.data.signin_info?.user_profile?.email
  };
};

export const processPostCheckRequest = async (req: Request) => {
  logger.info(`Return if new email address was confirmed`);

  const session: Session = req.session as Session;
  const emailConfirmation: string | undefined = req.body.emailConfirmation;
  if (emailConfirmation === undefined) {

    return {
      statementError: "You need to accept the registered email address statement",
      updatedCompanyEmail: req.session?.getExtraData(UPDATED_COMPANY_EMAIL),
      backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
      signoutBanner: true,
      userEmail: req.session?.data.signin_info?.user_profile?.email
    };
  }

  const companyNumber: string | undefined = session.getExtraData(COMPANY_NUMBER);
  const transactionId: string | undefined = session.getExtraData(SUBMISSION_ID);

  try {
    await closeTransaction(session, companyNumber, transactionId).then((transactionId) => {
      return {status: "success"};
    });
  } catch (e) {
    return {
      statementError: TRANSACTION_CLOSE_ERROR + companyNumber
    };
  }
};
