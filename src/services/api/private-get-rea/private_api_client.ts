import { IHttpClient } from "@companieshouse/api-sdk-node/dist/http";
import Registered_email_address_service from "./registered_email_address_service";

/**
 * ApiClient is the class that all service objects hang off.
 */
export default class Private_api_client {
  public readonly registeredEmailAddress: Registered_email_address_service;

  constructor (readonly apiClient: IHttpClient, readonly accountClient: IHttpClient) {
    // services on the api domain using the apiClient
    this.registeredEmailAddress = new Registered_email_address_service(apiClient);
  }
}
