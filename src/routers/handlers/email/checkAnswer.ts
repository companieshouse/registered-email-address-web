import {Request, Response} from "express";
import {GenericHandler} from "../generic";
import {Session} from "@companieshouse/node-session-handler";
import {logger} from "../../../lib/Logger";
import {
  COMPANY_EMAIL,
  COMPANY_NUMBER, CONFIRM_EMAIL_CHANGE_ERROR,
  SUBMISSION_ID,
  TRANSACTION_CLOSE_ERROR
} from "../../../constants/app.const";
import {EMAIL_CHANGE_EMAIL_ADDRESS_URL} from "../../../config";
import {createRegisteredEmailAddressResource} from "../../../services/company/createRegisteredEmailAddressResource";
import {closeTransaction} from "../../../services/transaction/transaction.service";

export class CheckAnswerHandler extends GenericHandler {

  constructor() {
    super();
  }

  async get(req: Request, response: Response): Promise<Object> {
    logger.info(`GET request to serve company confirm page`);

    const session: Session = req.session as Session;
    const companyEmail: string | undefined = session.getExtraData(COMPANY_EMAIL);

    return {
      companyEmail: companyEmail,
      backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
      signoutBanner: true,
      userEmail: req.session?.data.signin_info?.user_profile?.email
    };
  }

  async post(req: Request, response: Response): Promise<any> {
    logger.info(`POST request to serve company confirm page`);

    const session: Session = req.session as Session;
    const companyEmail = req.session?.getExtraData(COMPANY_EMAIL);
    const emailConfirmation: string | undefined = req.body.emailConfirmation;

    if (emailConfirmation === undefined) {
      return {
        statementError: CONFIRM_EMAIL_CHANGE_ERROR,
        companyEmail: companyEmail,
        backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
        signoutBanner: true,
        userEmail: req.session?.data.signin_info?.user_profile?.email
      };
    }

    const transactionId = session.getExtraData(SUBMISSION_ID);
    const companyNumber = session.getExtraData(COMPANY_NUMBER);

    return await createRegisteredEmailAddressResource(session, <string>transactionId, <string>companyEmail)
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
              companyEmail: companyEmail,
              backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
              signoutBanner: true,
              userEmail: req.session?.data.signin_info?.user_profile?.email
            };
          });
      }).catch((e) => {
        return {
          statementError: TRANSACTION_CLOSE_ERROR + companyNumber,
          companyEmail: companyEmail,
          backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
          signoutBanner: true,
          userEmail: req.session?.data.signin_info?.user_profile?.email
        };
      });
  }
}
