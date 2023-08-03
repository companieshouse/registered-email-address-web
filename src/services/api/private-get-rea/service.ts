import {IHttpClient} from "@companieshouse/api-sdk-node/dist/http";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import {createPrivateApiClient} from "./index";
import {CHS_API_KEY, ORACLE_QUERY_API_URL} from "../../../config";
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
    // build client object
    const client = createPrivateApiClient(
      CHS_API_KEY,
      undefined,
      ORACLE_QUERY_API_URL
    );

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
