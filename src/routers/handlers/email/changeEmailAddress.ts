import { Request, Response } from "express";
import { GenericHandler } from "../generic";
import { inject } from "inversify";
import { Session } from "@companieshouse/node-session-handler";
import { logger, createAndLogError } from "../../../utils/common/Logger";
import { validateEmailString } from "../../../utils/email/validateEmailString";
import { postTransaction } from "../../../services/transaction/transaction.service";
import { formatValidationError } from "../../../utils/error/formatValidationErrors";

import {
  COMPANY_NUMBER,
  SUBMISSION_ID,
  NO_EMAIL_ADDRESS_FOUND,
  EMAIL_ADDRESS_INVALID,
  NEW_EMAIL_ADDRESS,
  REGISTERED_EMAIL_ADDRESS,
  TRANSACTION_CREATE_ERROR,
  UPDATE_EMAIL_ERROR_KEY,
  UPDATE_EMAIL_ERROR_ANCHOR,
  COMPANY_PROFILE
} from "../../../constants/app.const";

import {
  COMPANY_BASE_URL,
  CONFIRM_URL,
  DESCRIPTION,
  REFERENCE
} from "../../../config";

import ValidationErrors from "../../../models/validationErrors.model";

import { StatusCodes } from 'http-status-codes';
import Optional from "../../../models/optional";
import FormValidator from "../../../utils/common/formValidator.util";
import formSchema from "../../../schemas/changeEmailAddress.schema";
import { RegisteredEmailAddress } from "services/api/private-get-rea";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import {DateTime} from "luxon";
import {toReadableFormat} from "../../../utils/common/date";

export class ChangeEmailAddressHandler extends GenericHandler {

  constructor (@inject(FormValidator) private validator: FormValidator, userEmail: string | undefined) {
    super();
    this.viewData.backUri = COMPANY_BASE_URL+CONFIRM_URL;
    if (userEmail !== undefined) {
      this.viewData.userEmail = userEmail;
    }
  }

  async get (req: Request, response: Response): Promise<Object> {
    logger.info(`GET request to serve change registered email address page`);

    const session: Session = req.session as Session;
    const companyNumber: string | undefined = session.getExtraData(COMPANY_NUMBER);
    const companyEmailAddress: RegisteredEmailAddress | undefined = session.getExtraData(REGISTERED_EMAIL_ADDRESS);
    const companyProfile: CompanyProfile | undefined = session.getExtraData(COMPANY_PROFILE);

    if (companyEmailAddress && companyNumber && companyProfile) {
      this.viewData.companyEmailAddress = companyEmailAddress;
      this.viewData.companyName = companyProfile.companyName.toUpperCase();
      this.viewData.companyNumber = companyProfile.companyNumber;
      // create transaction record
      await createTransaction(session, companyNumber).then((transactionId) => {
        // get transaction record data
        req.session?.setExtraData(SUBMISSION_ID, transactionId);
      }).catch(() => {
        logger.error(TRANSACTION_CREATE_ERROR + companyNumber);
        this.viewData.errors = formatValidationError(
          UPDATE_EMAIL_ERROR_KEY,
          UPDATE_EMAIL_ERROR_ANCHOR,
          TRANSACTION_CREATE_ERROR+companyNumber
        );
        return Promise.reject(this.viewData);
      });
    } else {
      logger.info(`company confirm - company email not found`);
      this.viewData.errors = formatValidationError(
        UPDATE_EMAIL_ERROR_KEY,
        UPDATE_EMAIL_ERROR_ANCHOR,
        NO_EMAIL_ADDRESS_FOUND
      );
      return Promise.reject(this.viewData);
    }

    return Promise.resolve(this.viewData);
  }

  async post (req: Request, response: Response): Promise<Object> {
    logger.info(`POST request to serve change registered email address page`);

    const session: Session = req.session as Session;
    const companyProfile: CompanyProfile | undefined = session.getExtraData(COMPANY_PROFILE);
    this.viewData.companyName = companyProfile?.companyName.toUpperCase();
    this.viewData.companyNumber = companyProfile?.companyNumber;

    const companyEmailAddressGiven: string = req.body.changeEmailAddress;

    const errors: Optional<ValidationErrors> = this.validator.validate(req.body, formSchema);

    //check: no email supplied
    if (errors) {
      this.viewData.errors = formatValidationError(
        UPDATE_EMAIL_ERROR_KEY,
        UPDATE_EMAIL_ERROR_ANCHOR,
        errors[UPDATE_EMAIL_ERROR_KEY]
      );
      return Promise.reject(this.viewData);
    }

    //check: email format invalid
    if (!validateEmailString(companyEmailAddressGiven)) {
      this.viewData.errors = formatValidationError(
        UPDATE_EMAIL_ERROR_KEY,
        UPDATE_EMAIL_ERROR_ANCHOR,
        EMAIL_ADDRESS_INVALID
      );
      return Promise.reject(this.viewData);
    } else {
      req.session?.setExtraData(NEW_EMAIL_ADDRESS, req.body.changeEmailAddress);
    }
    return Promise.resolve(this.viewData);
  }
}

// create transaction record
export const createTransaction = async (session: Session, companyNumber: string): Promise<string> => {
  let transactionId: string = "";
  try {
    await postTransaction(session, companyNumber, DESCRIPTION, REFERENCE).then((transaction) => {
      transactionId = transaction.id as string;
    });
    return Promise.resolve(transactionId);
  } catch (e) {
    logger.error( `update registered email address: ${StatusCodes.INTERNAL_SERVER_ERROR} - error while create transaction record for ${companyNumber}`);
    return Promise.reject(`${StatusCodes.INTERNAL_SERVER_ERROR}`);
  }
};
