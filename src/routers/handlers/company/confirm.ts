import {Request, Response} from "express";
import {GenericHandler} from "../generic";
import {Session} from "@companieshouse/node-session-handler";
import {logger} from "../../../lib/Logger";
import {
    COMPANY_NUMBER,
    SUBMISSION_ID,
    TRANSACTION_CLOSE_ERROR,
    UPDATED_COMPANY_EMAIL
} from "../../../constants/app.const";
import {EMAIL_CHANGE_EMAIL_ADDRESS_URL} from "../../../config";
import {createRegisteredEmailAddressResource} from "../../../services/company/createRegisteredEmailAddressResource";
import {closeTransaction} from "../../../services/transaction/transaction.service";

export class ConfirmCompanyHandler extends GenericHandler {

    constructor() {
        super();
    }

    async get(req: Request, response: Response): Promise<Object> {
        logger.info(`GET request to serve company confirm page`);

        const session: Session = req.session as Session;
        const updatedCompanyEmail: string | undefined = session.getExtraData(UPDATED_COMPANY_EMAIL);

        return {
            "updatedCompanyEmail": updatedCompanyEmail,
            backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
            signoutBanner: true,
            userEmail: req.session?.data.signin_info?.user_profile?.email
        };
    }

    async post(req: Request, response: Response): Promise<any> {
        logger.info(`POST request to serve company confirm page`);

        const session: Session = req.session as Session;
        const updatedCompanyEmail = req.session?.getExtraData(UPDATED_COMPANY_EMAIL);
        const emailConfirmation: string | undefined = req.body.emailConfirmation;

        if (emailConfirmation === undefined) {
            return {
                statementError: "You need to accept the registered email address statement",
                updatedCompanyEmail: updatedCompanyEmail,
                backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
                signoutBanner: true,
                userEmail: req.session?.data.signin_info?.user_profile?.email
            };
        }

        const transactionId = session.getExtraData(SUBMISSION_ID);
        const companyNumber = session.getExtraData(COMPANY_NUMBER);

        return await createRegisteredEmailAddressResource(session, <string>transactionId, <string>updatedCompanyEmail)
            .then(async () => {
                return await closeTransaction(session, <string>companyNumber, <string>transactionId)
                    .then(() => {
                        return {
                            backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
                            signoutBanner: true,
                            userEmail: req.session?.data.signin_info?.user_profile?.email
                        };
                    }).catch((err) => {
                        return {
                            statementError: err.message,
                            updatedCompanyEmail: updatedCompanyEmail,
                            backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
                            signoutBanner: true,
                            userEmail: req.session?.data.signin_info?.user_profile?.email
                        };
                    });
            }).catch((e) => {
                return {
                    statementError: TRANSACTION_CLOSE_ERROR + companyNumber,
                    updatedCompanyEmail: updatedCompanyEmail,
                    backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
                    signoutBanner: true,
                    userEmail: req.session?.data.signin_info?.user_profile?.email
                };
            });
    }
}
