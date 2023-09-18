import { Request, Response } from "express";
import { GenericHandler } from "../generic";
import { inject } from "inversify";
import { Session } from "@companieshouse/node-session-handler";
import { logger } from "../../../utils/common/logger";
import { validateEmailString } from "../../../utils/email/validate_email_string";
import { postTransaction } from "../../../services/transaction/transaction_service";
import { formatValidationError } from "../../../utils/error/format_validation_errors";

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
} from "../../../constants/app_const";

import {
  COMPANY_BASE_URL,
  CONFIRM_URL,
  DESCRIPTION,
  REFERENCE
} from "../../../config";

import ValidationErrors from "../../../models/validation_errors";

import { StatusCodes } from 'http-status-codes';
import Optional from "../../../models/optional";
import FormValidator from "../../../utils/common/form_validator";
import change_email_address_schema from "../../../schemas/change_email_address_schema";
import {RegisteredEmailAddress} from "@companieshouse/api-sdk-node/dist/services/registered-email-address/types";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

const PAGE_TITLE = "What is the new registered email address?";
const EVENT = "change-email-address-event";

export class ChangeEmailAddressHandler extends GenericHandler {

  constructor (@inject(FormValidator) private validator: FormValidator, userEmail: string | undefined) {
    super();
    this.viewData.backUri = COMPANY_BASE_URL+CONFIRM_URL;
    if (userEmail !== undefined) {
      this.viewData.eventType = EVENT;
      this.viewData.title = PAGE_TITLE;
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

    this.viewData.companyEmailAddress = session.getExtraData(REGISTERED_EMAIL_ADDRESS);
    const companyProfile: CompanyProfile | undefined = session.getExtraData(COMPANY_PROFILE);
    this.viewData.companyName = companyProfile?.companyName.toUpperCase();
    this.viewData.companyNumber = companyProfile?.companyNumber;

    const companyEmailAddressGiven: string = req.body.changeEmailAddress;

    const errors: Optional<ValidationErrors> = this.validator.validate(req.body, change_email_address_schema);

    //check: no email supplied
    if (errors) {
      this.viewData.title = "Error: " + PAGE_TITLE;
      this.viewData.errors = formatValidationError(
        UPDATE_EMAIL_ERROR_KEY,
        UPDATE_EMAIL_ERROR_ANCHOR,
        errors[UPDATE_EMAIL_ERROR_KEY]
      );
      return Promise.reject(this.viewData);
    }

    //check: email format invalid
    if (!validateEmailString(companyEmailAddressGiven)) {
      this.viewData.title = "Error: " + PAGE_TITLE;

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
