import { CsrfError } from "@companieshouse/web-security-node";
import { csrfErrorHandler } from "../../../src/middleware/csrf_middleware";


describe("csrfErrorHandler", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("calls next when not CSRF Error", () => {
    const nextMock = jest.fn();
    const notCsrfError = new Error("I am not a CSRF ERROR!");

    csrfErrorHandler(
      notCsrfError,
      // @ts-expect-error  Not using the attributes of request so can be an empty object
      {},
      {},
      nextMock
    );

    expect(nextMock).toHaveBeenCalledWith(notCsrfError);
  });

  it("renders 403 error when CSRF error", () => {
    const nextMock = jest.fn();
    const notCsrfError = new CsrfError("Token mismatch");

    const resMock: {
            status?: any,
            render?: any
        } = {};
    resMock.status = jest.fn((_) => resMock);
    resMock.render = jest.fn((_, __) => resMock);

    csrfErrorHandler(
      notCsrfError,
      // @ts-expect-error  Not using the attributes of request so can be an empty object
      {},
      resMock,
      nextMock
    );

    expect(nextMock).not.toHaveBeenCalled();
    expect(resMock.status).toHaveBeenCalledWith(403);
    expect(resMock.render).toHaveBeenCalledWith(
      "partials/error_403", {
        csrfErrors: true
      }
    );
  });
});
