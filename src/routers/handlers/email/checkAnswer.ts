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
  TRANSACTION_CLOSE_ERROR
} from "../../../constants/app.const";
import {EMAIL_CHANGE_EMAIL_ADDRESS_URL} from "../../../config";
import {createRegisteredEmailAddressResource} from "../../../services/email/createRegisteredEmailAddressResource";
import {closeTransaction} from "../../../services/transaction/transaction.service";
import {CompanyProfile} from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import {formatValidationError} from "../../../utils/error/formatValidationErrors";

const PAGE_TITLE = "Check your answer";

export class CheckAnswerHandler extends GenericHandler {

  constructor() {
    super();
    this.viewData.title = PAGE_TITLE;
    this.viewData.backUri = EMAIL_CHANGE_EMAIL_ADDRESS_URL;
  }

  async get(req: Request, response: Response): Promise<Object> {
    logger.info(`GET request to serve check your answer page`);

    const session: Session = req.session as Session;
    this.viewData.userEmail = req.session?.data.signin_info?.user_profile?.email;
    this.viewData.companyEmail = session.getExtraData(NEW_EMAIL_ADDRESS);

    const companyProfile: CompanyProfile | undefined = session.getExtraData(COMPANY_PROFILE);
    this.viewData.companyName = companyProfile?.companyName.toUpperCase();
    this.viewData.companyNumber = companyProfile?.companyNumber;

    return Promise.resolve (this.viewData);
  }

  async post(req: Request, response: Response): Promise<any> {
    logger.info(`POST request to serve check your answer page`);

    const session: Session = req.session as Session;

    this.viewData.userEmail = req.session?.data.signin_info?.user_profile?.email;
    const companyEmail = session.getExtraData(NEW_EMAIL_ADDRESS);
    this.viewData.companyEmail = companyEmail;

    const emailConfirmation: string | undefined = req.body.emailConfirmation;
    this.viewData.emailConfirmation = emailConfirmation;

    const companyProfile: CompanyProfile | undefined = session.getExtraData(COMPANY_PROFILE);
    const companyNumber = companyProfile?.companyNumber;
    this.viewData.companyName = companyProfile?.companyName.toUpperCase();
    this.viewData.companyNumber = companyNumber;

    if (emailConfirmation === undefined) {
      this.viewData.title = "Error: " + PAGE_TITLE;
      this.viewData.statementError = CONFIRM_EMAIL_CHANGE_ERROR;
      this.viewData.errors = formatValidationError("emailConfirmation", "#emailConfirmation", CONFIRM_EMAIL_CHANGE_ERROR);
      return Promise.reject(this.viewData);
    }

    const transactionId: string | undefined = session?.getExtraData(SUBMISSION_ID);

    return await createRegisteredEmailAddressResource(session, <string>transactionId, <string>companyEmail).then(async () => {
      // REA resource created so close the transaction
      return await closeTransaction(session, <string> companyNumber, <string>transactionId).then(() => {
        // Success!
        this.viewData.sessionID = transactionId;
        return Promise.resolve(this.viewData);
      }).catch(() => {
        // Failed to close the transaction
        return Promise.reject({ statementError: TRANSACTION_CLOSE_ERROR });
      });
    }).catch((e) => {
      // Failed to create the REA resource
      return Promise.reject({ statementError: FAILED_TO_CREATE_REA_ERROR });
    });
  }
}
