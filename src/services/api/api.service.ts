import { Session } from "@companieshouse/node-session-handler";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { AccessTokenKeys } from "@companieshouse/node-session-handler/lib/session/keys/AccessTokenKeys";
import { API_URL, CHS_API_KEY } from "../../config/index";
import { createAndLogError } from "../../lib/Logger";
import { createApiClient } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { THERE_IS_A_PROBLEM } from "../../constants/app.const";

export const createPublicOAuthApiClient = (session: Session): ApiClient => {
  const oAuth = session.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.AccessToken]?.[AccessTokenKeys.AccessToken];
  if (oAuth) {
    return createApiClient(undefined, oAuth, API_URL);
  }
  throw createAndLogError( THERE_IS_A_PROBLEM, "Error getting session keys for creating public api client");
};

export const createPublicApiKeyClient = (): ApiClient => {
  return createApiClient(CHS_API_KEY, undefined, API_URL);
};

export const createPaymentApiClient = (session: Session, paymentUrl: string): ApiClient => {
  const oAuth = session.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.AccessToken]?.[AccessTokenKeys.AccessToken];
  if (oAuth) {
    return createApiClient(undefined, oAuth, paymentUrl);
  }
  throw createAndLogError( THERE_IS_A_PROBLEM, "Error getting session keys for creating public api client");
};
