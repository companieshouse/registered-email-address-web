import {Request, Response} from "express";
import {GenericHandler} from "../generic";
import {Session} from "@companieshouse/node-session-handler";
import {logger} from "../../../utils/common/Logger";
import {
    COMPANY_PROFILE,
    CONFIRM_EMAIL_CHANGE_ERROR,
    FAILED_TO_CREATE_REA_ERROR,
    NEW_EMAIL_ADDRESS,
    SUBMISSION_ID,
    TRANSACTION_CLOSE_ERROR, TRANSACTION_DESCRIPTION_ID
} from "../../../constants/app.const";
import {EMAIL_CHANGE_EMAIL_ADDRESS_URL} from "../../../config";
import {createRegisteredEmailAddressResource} from "../../../services/email/createRegisteredEmailAddressResource";
import {closeTransaction} from "../../../services/transaction/transaction.service";
import {CompanyProfile} from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import {formatValidationError} from "../../../utils/formatValidationErrors";

export class CheckAnswerHandler extends GenericHandler {

    constructor() {
        super();
    }

    async get(req: Request, response: Response): Promise<Object> {
        logger.info(`GET request to serve check your answer page`);

        const session: Session = req.session as Session;
        const companyEmail: string | undefined = session.getExtraData(NEW_EMAIL_ADDRESS);
        const companyProfile: CompanyProfile | undefined = session.getExtraData(COMPANY_PROFILE);
        const companyNumber = companyProfile?.companyNumber;
        const companyName = companyProfile?.companyName.toUpperCase();

        return {
            companyEmail: companyEmail,
            companyName: companyName,
            companyNumber: companyNumber,
            backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
            signoutBanner: true,
            userEmail: req.session?.data.signin_info?.user_profile?.email
        };
    }

    async post(req: Request, response: Response): Promise<any> {
        logger.info(`POST request to serve check your answer page`);

        const session: Session = req.session as Session;
        const companyEmail: string | undefined = req.session?.getExtraData(NEW_EMAIL_ADDRESS);
        const emailConfirmation: string | undefined = req.body.emailConfirmation;
        const companyProfile: CompanyProfile | undefined = session.getExtraData(COMPANY_PROFILE);
        const companyNumber = companyProfile?.companyNumber;
        const companyName = companyProfile?.companyName.toUpperCase();
        const transactionDescription: | undefined = session.getExtraData(TRANSACTION_DESCRIPTION_ID);

        if (emailConfirmation === undefined) {
            return {
                statementError: CONFIRM_EMAIL_CHANGE_ERROR,
                errors: formatValidationError("emailConfirmation", "#emailConfirmation", CONFIRM_EMAIL_CHANGE_ERROR),
                companyEmail: companyEmail,
                companyName: companyName,
                companyNumber: companyNumber,
                backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
                signoutBanner: true,
                userEmail: req.session?.data.signin_info?.user_profile?.email
            };
        }

        const transactionId: string | undefined = session?.getExtraData(SUBMISSION_ID);

        return await createRegisteredEmailAddressResource(session, <string>transactionId, <string>companyEmail)
            .then(async () => {
                return await closeTransaction(session, <string>companyNumber, <string>transactionId, <any>transactionDescription)
                    .then(() => {
                        return {
                            backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
                            signoutBanner: true,
                            userEmail: req.session?.data.signin_info?.user_profile?.email,
                            submissionID: transactionId
                        };
                    }).catch((err) => {
                        return {
                            errors: TRANSACTION_CLOSE_ERROR + companyNumber,
                            companyEmail: companyEmail,
                            companyName: companyName,
                            companyNumber: companyNumber,
                            backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
                            signoutBanner: true,
                            userEmail: req.session?.data.signin_info?.user_profile?.email
                        };
                    });
            }).catch((e) => {
                return {
                    errors: FAILED_TO_CREATE_REA_ERROR + companyNumber,
                    companyEmail: companyEmail,
                    companyName: companyName,
                    companyNumber: companyNumber,
                    backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
                    signoutBanner: true,
                    userEmail: req.session?.data.signin_info?.user_profile?.email
                };
            });
    }
}
