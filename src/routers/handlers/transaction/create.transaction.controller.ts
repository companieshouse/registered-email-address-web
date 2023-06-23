import { postTransaction } from "../../../services/transaction/transaction.service";
import { NextFunction, Request, Response } from "express";
// import { urlUtils } from "../utils/url";
// import { ACTIVE_DIRECTORS_PATH, TRADING_STATUS_PATH, urlParams, URL_QUERY_PARAM } from "../types/page.urls";
import { DESCRIPTION, REFERENCE, urlParams } from "../../../config/index";
import { Session } from "@companieshouse/node-session-handler";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = req.session as Session;
        const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];
        const transaction: Transaction = await postTransaction(session, companyNumber, DESCRIPTION, REFERENCE);
        const transactionId = transaction.id as string;
        // req.params[urlParams.PARAM_TRANSACTION_ID] = transactionId;
        // req.params[urlParams.PARAM_SUBMISSION_ID] = STATIC_SUBMISSION_ID;
        // var nextPageUrl = urlUtils.getUrlToPath(ACTIVE_DIRECTORS_PATH, req)
        return res.redirect("www.rte.ie/sport");
    } catch (e) {
        return next(e);
    }
};
