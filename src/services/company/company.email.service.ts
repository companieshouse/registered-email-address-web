import { companyEmailResource, companyEmail } from "./resources/resources";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { CHS_API_KEY } from "../../config/index";

/**
* Get the registered email address for a company.
*
* @param companyNumber the company number to look up
*/
export const getCompanyEmail = async (companyNumber: string): Promise<Resource<companyEmail>> => {
    const apiClient: ApiClient = createApiClient(CHS_API_KEY)
    const resp = await apiClient.apiClient.httpGet(`/company/${companyNumber}/registered-email-address`);

    const emailResource: Resource<companyEmail> = {
        httpStatusCode: resp.status
    };

    if (resp.error) {
        return emailResource;
    }

    // cast response body to expected companyEmailResource type
    const body = resp.body as companyEmailResource;

    emailResource.resource = {
        companyEmail: body.registered_email_address
    };
    return emailResource;
}
