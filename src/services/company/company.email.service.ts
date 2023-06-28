import { companyEmailResource, companyEmail } from "./resources/resources";
import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { CHS_API_KEY } from "../../config/index";
import { StatusCodes } from 'http-status-codes';

/**
* Get the registered email address for a company.
*
* @param companyNumber the company number to look up
*/
export const getCompanyEmail = async (companyNumber: string): Promise<Resource<companyEmail>> => {
  const client = createApiClient(CHS_API_KEY);
  const resp = await client.apiClient.httpGet(`/company/${companyNumber}/registered-email-address`);

  const emailResource: Resource<companyEmail> = {
    httpStatusCode: resp.status
  };

  // return error response code if one received
  if (resp.status >= StatusCodes.BAD_REQUEST) {
    return emailResource;
  }

  // cast response body to expected companyEmailResource type
  const body = resp.body as companyEmailResource;

  emailResource.resource = {
    companyEmail: body.registered_email_address
  };
  return emailResource;
};
