import { Request, Response } from "express";
import { GenericHandler } from "./../generic";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { getCompanyProfile } from "../../../services/company/company.profile.service";
import { buildAddress, formatForDisplay } from "../../../services/company/confirm.company.service";
import { getCompanyEmail } from "../../../services/company/company.email.service";
import { logger } from "../../../lib/Logger";
import * as constants from "../../../constants/app.const";
import * as validationConstants from "../../../constants/validation.const";
import * as config from "../../../config/index";
import {
  COMPANY_NUMBER,
  SUBMISSION_ID,
  TRANSACTION_CLOSE_ERROR,
  UPDATED_COMPANY_EMAIL
} from "../../../constants/app.const";
import {EMAIL_CHANGE_EMAIL_ADDRESS_URL} from "../../../config/index";
import {createRegisteredEmailAddressResource} from "../../../services/company/createRegisteredEmailAddressResource";
import {closeTransaction} from "../../../services/transaction/transaction.service";


export class ConfirmCompanyHandler extends GenericHandler {

  constructor () {
    super();
  }

  async get (req: Request, response: Response): Promise<Object> {
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

  async post (req: Request, response: Response): Promise<any> {
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
        .then(async (res) => {
          return await closeTransaction(session, <string>companyNumber, <string>transactionId)
              .then((res) => {
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
//     const session: Session = req.session as Session;
//     const updatedCompanyEmail = req.session?.getExtraData(UPDATED_COMPANY_EMAIL);
//     const emailConfirmation: string | undefined = req.body.emailConfirmation;
//     if (emailConfirmation === undefined) {
//         return {
//             statementError: "You need to accept the registered email address statement",
//             updatedCompanyEmail: updatedCompanyEmail,
//             backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
//             signoutBanner: true,
//             userEmail: req.session?.data.signin_info?.user_profile?.email
//         };
//     }
//
//     const transactionId = session.getExtraData(SUBMISSION_ID);
//     const companyNumber = session.getExtraData(COMPANY_NUMBER);
//
//     return await createRegisteredEmailAddressResource(session, <string>transactionId, <string>updatedCompanyEmail)
//         .then(async () => {
//             return await closeTransaction(session, <string>companyNumber, <string>transactionId).then(() => {
//                 return {
//                     backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
//                     signoutBanner: true,
//                     userEmail: req.session?.data.signin_info?.user_profile?.email
//                 };
//             }).catch((err) => {
//                 return {
//                     statementError: err.message,
//                     updatedCompanyEmail: updatedCompanyEmail,
//                     backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
//                     signoutBanner: true,
//                     userEmail: req.session?.data.signin_info?.user_profile?.email
//                 };
//             });
//         }).catch((e) => {
//             return {
//                 statementError: TRANSACTION_CLOSE_ERROR + companyNumber,
//                 updatedCompanyEmail: updatedCompanyEmail,
//                 backUri: EMAIL_CHANGE_EMAIL_ADDRESS_URL,
//                 signoutBanner: true,
//                 userEmail: req.session?.data.signin_info?.user_profile?.email
//             };
//         });
  }

  buildPageOptions (session: Session, companyProfile: CompanyProfile){
    const formattedCompanyProfile = formatForDisplay(companyProfile);
    const address = buildAddress(formattedCompanyProfile);
    this.viewData.companyProfile = companyProfile;
    this.viewData.company = formattedCompanyProfile;
    this.viewData.address = address;
    this.viewData.userEmail = session.data.signin_info?.user_profile?.email;
    this.viewData.backUri = config.COMPANY_NUMBER_URL;
  }


}
