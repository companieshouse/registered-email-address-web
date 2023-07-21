import {Request, Response} from "express";
import {GenericHandler} from "../generic";
import {Session} from "@companieshouse/node-session-handler";
import {logger} from "../../../utils/common/Logger";
import {
  REGISTERED_EMAIL_ADDRESS,
  NEW_EMAIL_ADDRESS,
  COMPANY_NUMBER, CONFIRM_EMAIL_CHANGE_ERROR,
  SUBMISSION_ID,
  TRANSACTION_CLOSE_ERROR,
  FAILED_TO_CREATE_REA_ERROR,
  COMPANY_PROFILE
} from "../../../constants/app.const";
import {EMAIL_CHANGE_EMAIL_ADDRESS_URL} from "../../../config";
import {createRegisteredEmailAddressResource} from "../../../services/email/createRegisteredEmailAddressResource";
import {closeTransaction} from "../../../services/transaction/transaction.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

export class CheckAnswerHandler extends GenericHandler {

  constructor() {
    super();
  }

  async get(req: Request, response: Response): Promise<Object> {
    logger.info(`GET request to serve check your answer page`);

    const session: Session = req.session as Session;
    const companyEmail: string | undefined = session.getExtraData(NEW_EMAIL_ADDRESS);
    const companyProfile: CompanyProfile | undefined = session.getExtraData(COMPANY_PROFILE);

    return {
      companyEmail: companyEmail,
      backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
      signoutBanner: true,
      userEmail: req.session?.data.signin_info?.user_profile?.email,
      companyName: companyProfile?.companyName.toUpperCase(),
      companyNumber: companyProfile?.companyNumber
    };
  }

  async post(req: Request, response: Response): Promise<any> {
    logger.info(`POST request to serve check your answer page`);

    const session: Session = req.session as Session;
    const companyEmail: string | undefined  = req.session?.getExtraData(NEW_EMAIL_ADDRESS);
    const emailConfirmation: string | undefined = req.body.emailConfirmation;
    const companyProfile: CompanyProfile | undefined = session.getExtraData(COMPANY_PROFILE);

    if (emailConfirmation === undefined) {
      return {
        statementError: CONFIRM_EMAIL_CHANGE_ERROR,
        errors: CONFIRM_EMAIL_CHANGE_ERROR,
        companyEmail: companyEmail,
        backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
        signoutBanner: true,
        userEmail: req.session?.data.signin_info?.user_profile?.email,
        companyName: companyProfile?.companyName.toUpperCase(),
        companyNumber: companyProfile?.companyNumber
      };
    }

    const transactionId: string | undefined  = session?.getExtraData(SUBMISSION_ID);
    const companyNumber: string | undefined = session?.getExtraData(COMPANY_NUMBER);

    return await createRegisteredEmailAddressResource(session, <string>transactionId, <string>companyEmail)
      .then(async () => {
        return await closeTransaction(session, <string> companyNumber, <string>transactionId)
          .then(() => {
            return {
              backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
              signoutBanner: true,
              userEmail: req.session?.data.signin_info?.user_profile?.email,
              submissionID: transactionId,
              companyName: companyProfile?.companyName.toUpperCase(),
              companyNumber: companyProfile?.companyNumber
            };
          }).catch((err) => {
            return {
              errors: TRANSACTION_CLOSE_ERROR + companyNumber,
              companyEmail: companyEmail,
              backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
              signoutBanner: true,
              userEmail: req.session?.data.signin_info?.user_profile?.email,
              companyName: companyProfile?.companyName.toUpperCase(),
              companyNumber: companyProfile?.companyNumber
            };
          });
      }).catch((e) => {
        return {
          errors: FAILED_TO_CREATE_REA_ERROR + companyNumber,
          companyEmail: companyEmail,
          backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
          signoutBanner: true,
          userEmail: req.session?.data.signin_info?.user_profile?.email,
          companyName: companyProfile?.companyName.toUpperCase(),
          companyNumber: companyProfile?.companyNumber
        };
      });
  }
}
