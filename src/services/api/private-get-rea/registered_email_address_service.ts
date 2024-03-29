import {IHttpClient} from "@companieshouse/api-sdk-node/dist/http";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import {
  RegisteredEmailAddress,
  RegisteredEmailAddressResource
} from "@companieshouse/api-sdk-node/dist/services/registered-email-address/types";

/**
 * https://developer.companieshouse.gov.uk/api/docs/company/company_number/company_number.html
 */
export default class RegisteredEmailAddressService {
  constructor(private readonly client: IHttpClient) {
  }

  /**
     * Get the registered email address for a company.
     *
     * @param number the company number to look up
     */
  public async getRegisteredEmailAddress(number: string): Promise<Resource<RegisteredEmailAddress>> {
    const resp = await this.client.httpGet(`/company/${number}/registered-email-address`);

    const resource: Resource<RegisteredEmailAddress> = {
      httpStatusCode: resp.status
    };

    if (resp.error) {
      return resource;
    }

    // cast the response body to the expected type
    const body = resp.body as RegisteredEmailAddressResource;

    resource.resource = {
      registeredEmailAddress: body.registered_email_address,
      acceptAppropriateEmailAddressStatement: body.accept_appropriate_email_address_statement
    };

    return resource;
  }
}
