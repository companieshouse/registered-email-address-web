import "reflect-metadata";

import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { provide } from "inversify-binding-decorators";

import CompanyDetails from "../../models/companyDetails.model";

@provide(CompanyDetailsMapper)
export default class CompanyDetailsMapper {

    public mapToCompanyDetails (company: CompanyProfile): CompanyDetails {
        return {
            companyNumber: company.companyNumber,
            companyName: company.companyName,
            companyStatus: company.companyStatus,
            companyIncDate: company.dateOfCreation,
            companyType: company.type
        };
    }
}
