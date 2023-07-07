import { Request, Response } from "express";
import { GenericHandler } from "../generic";
import { inject } from "inversify";
import { Session } from "@companieshouse/node-session-handler";
import { logger, createAndLogError } from "../../../lib/Logger";
import { validateEmailString } from "../../../utils/validateEmailString";
import { getCompanyEmail } from "../../../services/company/company.email.service";
import { postTransaction } from "../../../services/transaction/transaction.service";

import { 
  COMPANY_EMAIL,
  COMPANY_NUMBER,
  SUBMISSION_ID,
  NO_EMAIL_ADDRESS_FOUND,
  EMAIL_ADDRESS_INVALID,
  TRANSACTION_CREATE_ERROR 
} from "../../../constants/app.const";

import { 
  COMPANY_BASE_URL,
  CONFIRM_URL,
  DESCRIPTION,
  REFERENCE 
} from "../../../config/index";

import ValidationErrors from "../../../models/view/validationErrors.model";

import { StatusCodes } from 'http-status-codes';
import Optional from "../../../models/optional";
import FormValidator from "../../../utils/formValidator.util";
import formSchema from "../../../schemas/changeEmailAddress.schema";

export class ChangeEmailAddressHandler extends GenericHandler {

  constructor (@inject(FormValidator) private validator: FormValidator, userEmail: string | undefined) {
    super();
    this.viewData.title = "Update a registered email address";
    this.viewData.backUri = COMPANY_BASE_URL+CONFIRM_URL;
    if (userEmail !== undefined) {
      this.viewData.userEmail = userEmail;
    }
  }

  async get (req: Request, response: Response): Promise<Object> {
    logger.info(`GET request to serve change registered email address page`);

    const session: Session = req.session as Session;
    const companyNumber: string | undefined = req.session?.getExtraData(COMPANY_NUMBER);
    const companyEmailAddress: string | undefined = req.session?.getExtraData(COMPANY_EMAIL);

    // check session state - if not found, we'll need a call to oracle api
    if (companyEmailAddress !== undefined) {
      this.viewData.companyEmailAddress = companyEmailAddress;
      return Promise.resolve(this.viewData); 
    } else {
      if (companyNumber !== undefined) {
        // create transaction record
        try {
          // get transaction record data
          await createTransaction(session, companyNumber).then((transactionId) => {
            req.session?.setExtraData(SUBMISSION_ID, transactionId);
          });
        } catch (e) {
          this.viewData.errors = {
            companyNumber: TRANSACTION_CREATE_ERROR+companyNumber
          };
          return this.viewData;
        }
        await getCompanyEmail(companyNumber).then((companyEmail) => {
          if (companyEmail.resource?.companyEmail === undefined) {
            this.viewData.errors = {
              changeEmailAddress: NO_EMAIL_ADDRESS_FOUND
            };
            return Promise.resolve(this.viewData);
          } else {
            this.viewData.companyEmailAddress = companyEmail.resource?.companyEmail;
          }
        });
      }
    }
    return Promise.resolve(this.viewData);
  }

  async post (req: Request, response: Response): Promise<Object> {
    logger.info(`POST request to serve change registered email address page`);

    const companyEmailAddressGiven: string = req.body.changeEmailAddress;

    const errors: Optional<ValidationErrors> = this.validator.validate(req.body, formSchema);

    //check: no email supplied
    if (errors) {
      this.viewData.errors = errors;
      return this.viewData;
    }

    //check: email format invalid
    if (!validateEmailString(companyEmailAddressGiven)) {
      this.viewData.errors = {
        changeEmailAddress: EMAIL_ADDRESS_INVALID
      };
      return Promise.resolve(this.viewData);
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
    throw createAndLogError(`update registered email address: ${StatusCodes.INTERNAL_SERVER_ERROR} - error while create transaction record for ${companyNumber}`);
  }
};
