import {companyEmail, companyEmailResource} from "./resources/resources";
import {createApiClient, Resource} from "@companieshouse/api-sdk-node";
import {
    CHS_API_KEY,
    EMAIL_CHANGE_EMAIL_ADDRESS_URL,
    EMAIL_CHECK_ANSWER_URL,
    ORACLE_QUERY_API_URL
} from "../../config/index";
import {StatusCodes} from 'http-status-codes';
import logger from "../../lib/Logger";
import {Request} from "express";
import {Session} from "@companieshouse/node-session-handler";
import {UPDATED_COMPANY_EMAIL} from "../../constants/app.const";


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
        backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL
    };
};

export const processPostCheckRequest = async (req: Request) => {
    logger.info(`Return if new email address was confirmed`);

    const emailConfirmation: string | undefined = req.body.emailConfirmation;

    if (emailConfirmation === undefined) {
        return {
            errors: "You need to accept the registered email address statement",
            updatedCompanyEmail: req.session?.getExtraData(UPDATED_COMPANY_EMAIL),
            backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL
        };
    }

    return {emailConfirmation: emailConfirmation};
};
