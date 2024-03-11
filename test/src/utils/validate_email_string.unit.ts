import {validateEmailString} from "../../../src/utils/email/validate_email_string";


describe("Validate email string test", () => {

  describe("Valid tests", () => {
    it("Should accept valid email addresses", () => {
      expect(validateEmailString("email_address@domain.com")).toBe(true);
      expect(validateEmailString("email@domain.com")).toBe(true);
      expect(validateEmailString("email@domain.COM")).toBe(true);
      expect(validateEmailString("firstname.lastname@domain.com")).toBe(true);
      expect(validateEmailString("email@subdomain.domain.com")).toBe(true);
      expect(validateEmailString("firstname+lastname@domain.com")).toBe(true);
      expect(validateEmailString("1234567890@domain.com")).toBe(true);
      expect(validateEmailString("email@domain-one.com")).toBe(true);
      expect(validateEmailString("_______@domain.com")).toBe(true);
      expect(validateEmailString("email@domain.name")).toBe(true);
      expect(validateEmailString("email@domain.superlongtld")).toBe(true);
      expect(validateEmailString("email@domain.co.jp")).toBe(true);
      expect(validateEmailString("info@german-financial-services.reallylongarbitrarytldthatiswaytoohugejustincase")).toBe(true);
    });
  });

  describe("Invalid tests", () => {
    it("Should reject invalid email addresses", () => {
      expect(validateEmailString("plainaddress")).toBe(false);
      expect(validateEmailString("@no-local-part.com")).toBe(false);
      expect(validateEmailString("Outlook Contact <outlook-contact@domain.com>")).toBe(false);
      expect(validateEmailString("no-at.domain.com")).toBe(false);
      expect(validateEmailString(";beginning-semicolon@domain.co.uk")).toBe(false);
      expect(validateEmailString("\"email+leading-quotes@domain.com")).toBe(false);
      expect(validateEmailString("email+middle\"-quotes@domain.com")).toBe(false);
      expect(validateEmailString("\"quoted-local-part\"@domain.com")).toBe(false);
      expect(validateEmailString("\"quoted@domain.com\"")).toBe(false);
      expect(validateEmailString("multiple@domains@domain.com")).toBe(false);
      expect(validateEmailString("spaces in local@domain.com")).toBe(false);
      expect(validateEmailString("spaces-in-domain@dom ain.com")).toBe(false);
      expect(validateEmailString("comma,in-local@gov.uk")).toBe(false);
      expect(validateEmailString("comma-in-domain@domain,gov.uk")).toBe(false);
      expect(validateEmailString("pound-sign-in-local£@domain.com")).toBe(false);
      // expect(validateEmailString("local-with-'-apostrophe@domain.com")).toBe(false);  // This is not caught by the current onelogin rules
      expect(validateEmailString("local-with-\"-quotes@domain.com")).toBe(false);
      expect(validateEmailString("domain-starts-with-a-dot@.domain.com")).toBe(false);
      expect(validateEmailString("Dörte@Sörensen.example.com")).toBe(false);
      expect(validateEmailString("χρήστης@παράδειγμα.ελ")).toBe(false);
      expect(validateEmailString("Dörte@hotmail.com")).toBe(false);
    });
  });
});
