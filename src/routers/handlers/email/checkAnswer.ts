import {Request, Response} from "express";
import {GenericHandler} from "../generic";
import {Session} from "@companieshouse/node-session-handler";
import {logger} from "../../../utils/common/Logger";
import {
  CHECK_ANSWER_ERROR_ANCHOR,
  CHECK_ANSWER_ERROR_KEY,
  COMPANY_PROFILE,
  CONFIRM_EMAIL_CHANGE_ERROR,
  FAILED_TO_CREATE_REA_ERROR,
  NEW_EMAIL_ADDRESS,
  SUBMISSION_ID,
  TRANSACTION_CLOSE_ERROR
} from "../../../constants/app.const";
import {EMAIL_CHANGE_EMAIL_ADDRESS_URL} from "../../../config";
import {postRegisteredEmailAddress} from "../../../services/email/email.registered.service";
import {CompanyProfile} from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import {formatValidationError} from "../../../utils/error/formatValidationErrors";
import {closeTransaction} from "../../../services/transaction/transaction.service";
import {
  RegisteredEmailAddress,
  RegisteredEmailAddressCreatedResource
} from "@companieshouse/api-sdk-node/dist/services/registered-email-address/types";
import {ApiResponse} from "@companieshouse/api-sdk-node/dist/services/resource";

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

    return Promise.resolve(this.viewData);
  }

  async post(req: Request, response: Response): Promise<any> {
    logger.info(`POST request to serve check your answer page`);

    const session: Session = req.session as Session;

    this.viewData.userEmail = req.session?.data.signin_info?.user_profile?.email;
    const companyEmail = <string>session.getExtraData(NEW_EMAIL_ADDRESS);
    this.viewData.companyEmail = companyEmail;

    const acceptAppropriateEmailAddressStatement: boolean | undefined = req.body.acceptAppropriateEmailAddressStatement;
    this.viewData.acceptAppropriateEmailAddressStatement = acceptAppropriateEmailAddressStatement;

    const companyProfile: CompanyProfile | undefined = session.getExtraData(COMPANY_PROFILE);
    const companyNumber: string = <string>companyProfile?.companyNumber;
    this.viewData.companyName = companyProfile?.companyName.toUpperCase();
    this.viewData.companyNumber = companyNumber;

    if (acceptAppropriateEmailAddressStatement === undefined) {
      this.viewData.title = "Error: " + PAGE_TITLE;
      this.viewData.statementError = CONFIRM_EMAIL_CHANGE_ERROR;
      this.viewData.errors = formatValidationError(CHECK_ANSWER_ERROR_KEY, CHECK_ANSWER_ERROR_ANCHOR, CONFIRM_EMAIL_CHANGE_ERROR);
      return Promise.reject(this.viewData);
    }

    const transactionId: string = <string>session.getExtraData(SUBMISSION_ID);

    const registeredEmailAddress: RegisteredEmailAddress = {
      registeredEmailAddress: companyEmail,
      acceptAppropriateEmailAddressStatement: acceptAppropriateEmailAddressStatement
    };

    const apiResponse: ApiResponse<RegisteredEmailAddressCreatedResource> = await postRegisteredEmailAddress(session, transactionId, companyNumber, registeredEmailAddress)
      .catch(() => {
        // Failed to create the REA resource
        return Promise.reject({statementError: FAILED_TO_CREATE_REA_ERROR + companyNumber});
      });

    const castedResponse: RegisteredEmailAddressCreatedResource = apiResponse.resource as RegisteredEmailAddressCreatedResource;

    await closeTransaction(session, companyNumber, transactionId, castedResponse.id)
      .catch(() => {
        // Failed to close the transaction
        return Promise.reject({statementError: TRANSACTION_CLOSE_ERROR + companyNumber});
      });

    // Success!
    this.viewData.sessionID = transactionId;
    return Promise.resolve(this.viewData);
  }
}
