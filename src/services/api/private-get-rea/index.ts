import PrivateApiClient from "./privateApiClient";
import { API_URL, ACCOUNT_URL } from "./config";
import { RequestClient, HttpClientOptions, IHttpClient } from "@companieshouse/api-sdk-node/dist/http";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import { PRIVATE_API_ERROR } from "../../../constants/app.const";

/**
 * Creates a new API Client.
 *
 * @param apiKey the api key to use for authentication
 * @param oauthToken a user's oauth token that can be used for authentication
 * @param baseUrl the api base url
 */
export const createPrivateApiClient = (apiKey?: string, oauthToken?: string, baseUrl: string = API_URL, baseAccountUrl: string = ACCOUNT_URL): PrivateApiClient => {
  if (apiKey && oauthToken) {
    throw new Error(PRIVATE_API_ERROR);
  }

  // the http client adapter for the api domain
  const apiOptions: HttpClientOptions = {
    apiKey,
    baseUrl,
    oauthToken
  };
  const apiHttpClient = new RequestClient(apiOptions);

  // the http client adapter for the account domain
  const accountOptions: HttpClientOptions = {
    apiKey: apiKey,
    baseUrl: baseAccountUrl,
    oauthToken: oauthToken
  };
  const accountHttpClient = new RequestClient(accountOptions);

  // the api client
  return new PrivateApiClient(apiHttpClient, accountHttpClient);
};

// exports used by private sdk to provide private services without the need to duplicate configs or http client logic
export { IHttpClient, HttpClientOptions, RequestClient, API_URL, ACCOUNT_URL, Resource };

export * from "./types";
export * from "./service";
