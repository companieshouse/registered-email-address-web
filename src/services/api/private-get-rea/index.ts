import PrivateApiClient from "./private_api_client";
import { CHS_INTERNAL_API_KEY, ORACLE_QUERY_API_URL } from "../../../config";
import { RequestClient, HttpClientOptions } from "@companieshouse/api-sdk-node/dist/http";

/**
 * Creates a new API Client.
 */
export const createPrivateApiClient = (): PrivateApiClient => {

  // the http client adapter for the api domain
  const apiOptions: HttpClientOptions = {
    apiKey: CHS_INTERNAL_API_KEY,
    baseUrl: ORACLE_QUERY_API_URL,
    oauthToken: undefined
  };
  const apiHttpClient = new RequestClient(apiOptions);

  // the api client
  return new PrivateApiClient(apiHttpClient);
};
