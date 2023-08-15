import { provide } from "inversify-binding-decorators";

@provide(Company_number_sanitizer)
export default class Company_number_sanitizer {
  private readonly COMPANY_NUMBER_SIZE: number = 8;

  public sanitizeCompany (companyNumber: string): string {
    if (!companyNumber?.trim()) {
      return "";
    }
    const uppercaseCompanyNumber: string = companyNumber.toUpperCase();
    const strippedCompanyNumber: string = this.stripWhitespaces(uppercaseCompanyNumber);

    return this.padNumber(strippedCompanyNumber);
  }

  private stripWhitespaces (companyNumber: string): string {
    return companyNumber.replace(/\s/g, "");
  }

  private padNumber (companyNumber: string): string {
    if (!Company_number_sanitizer.isAlphaPrefix(companyNumber)) {
      return companyNumber.padStart(this.COMPANY_NUMBER_SIZE, "0");
    }
    const leadingChars: string = companyNumber.substring(0, 2);
    const trailingChars: string = companyNumber
      .substring(2, companyNumber.length)
      .padStart(6, "0");

    return leadingChars + trailingChars;
  }

  private static isAlphaPrefix (companyNumber: string): boolean {
    return /^([a-zA-Z]{2}?)/gm.test(companyNumber);
  }
}
