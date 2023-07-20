import {Request, Response} from "express";
import {GenericHandler} from "../generic";
import {Session} from "@companieshouse/node-session-handler";
import {logger} from "../../../utils/common/Logger";
import {
  NEW_EMAIL_ADDRESS,
  COMPANY_NUMBER, CONFIRM_EMAIL_CHANGE_ERROR,
  SUBMISSION_ID,
  TRANSACTION_CLOSE_ERROR,
  FAILED_TO_CREATE_REA_ERROR
} from "../../../constants/app.const";
import {EMAIL_CHANGE_EMAIL_ADDRESS_URL} from "../../../config";
import {createRegisteredEmailAddressResource} from "../../../services/email/createRegisteredEmailAddressResource";
import {closeTransaction} from "../../../services/transaction/transaction.service";

export class CheckAnswerHandler extends GenericHandler {

  constructor() {
    super();
  }

  async get(req: Request, response: Response): Promise<Object> {
    logger.info(`GET request to serve check your answer page`);

    const session: Session = req.session as Session;
    const companyEmail: string | undefined = session.getExtraData(NEW_EMAIL_ADDRESS);

    return Promise.resolve ({
      companyEmail: companyEmail,
      backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
      signoutBanner: true,
      userEmail: req.session?.data.signin_info?.user_profile?.email
    });
  }

  async post(req: Request, response: Response): Promise<any> {
    logger.info(`POST request to serve check your answer page`);

    const session: Session = req.session as Session;
    const companyEmail: string | undefined  = req.session?.getExtraData(NEW_EMAIL_ADDRESS);
    const emailConfirmation: string | undefined = req.body.emailConfirmation;

    if (emailConfirmation === undefined) {
      return Promise.reject({
        statementError: CONFIRM_EMAIL_CHANGE_ERROR,
        errors: CONFIRM_EMAIL_CHANGE_ERROR,
        companyEmail: companyEmail,
        backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
        signoutBanner: true,
        userEmail: req.session?.data.signin_info?.user_profile?.email
      });
    }

    const transactionId: string | undefined  = session?.getExtraData(SUBMISSION_ID);
    const companyNumber: string | undefined = session?.getExtraData(COMPANY_NUMBER);

    return await createRegisteredEmailAddressResource(session, <string>transactionId, <string>companyEmail).then(async () => {
      return await closeTransaction(session, <string> companyNumber, <string>transactionId).then(() => {
        return Promise.resolve({
          signoutBanner: true,
          userEmail: req.session?.data.signin_info?.user_profile?.email,
          submissionID: transactionId
        });
      }).catch(() => {
        return Promise.reject({
          errors: TRANSACTION_CLOSE_ERROR + companyNumber,
          companyEmail: companyEmail,
          backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
          signoutBanner: true,
          userEmail: req.session?.data.signin_info?.user_profile?.email
        });
      });
    }).catch((e) => {
      return Promise.reject({
        errors: FAILED_TO_CREATE_REA_ERROR + companyNumber,
        companyEmail: companyEmail,
        backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
        signoutBanner: true,
        userEmail: req.session?.data.signin_info?.user_profile?.email
      });
    });
  }
}
