import { IHttpClient } from "@companieshouse/api-sdk-node/dist/http";
import RegisteredEmailAddressService from "./RegisteredEmailAddressService";

/**
 * ApiClient is the class that all service objects hang off.
 */
export default class PrivateApiClient {
  public readonly registeredEmailAddress: RegisteredEmailAddressService;

  constructor (readonly apiClient: IHttpClient, readonly accountClient: IHttpClient) {
    // services on the api domain using the apiClient
    this.registeredEmailAddress = new RegisteredEmailAddressService(apiClient);
  }
}
