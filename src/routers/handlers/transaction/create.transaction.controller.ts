import { postTransaction } from "../../../services/transaction/transaction.service";
import { NextFunction, Request, Response } from "express";
import { DESCRIPTION, REFERENCE, urlParams } from "../../../config/index";
import { Session } from "@companieshouse/node-session-handler";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as Session;
    const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];
    const transaction: Transaction = await postTransaction(session, companyNumber, DESCRIPTION, REFERENCE);
    const transactionId = transaction.id as string;
    return res.redirect("/test");
  } catch (e) {
    return next(e);
  }
};
