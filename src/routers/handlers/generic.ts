// Generic handler is the base handler that is extended by all other handlers
// It contains methods that are common to multiple route handlers
import { BaseHttpController } from "inversify-express-utils";
import "reflect-metadata";

import errorManifest from "../../utils/error/error.manifest";
import { SESSION_COUNTDOWN, SESSION_TIMEOUT } from "../../config";

export abstract class GenericHandler extends BaseHttpController {

  viewData: any;
  errorManifest: any;

  constructor () {
    super();
    this.errorManifest = errorManifest;
    this.viewData = {};
    this.viewData.signoutBanner = true;
    this.viewData.sessionTimeout = SESSION_TIMEOUT;
    this.viewData.sessionCountdown = SESSION_COUNTDOWN;
  }

  processHandlerException (err: any): Object {
    if (err.name === "VALIDATION_ERRORS") {
      return err.stack;
    }
    return {
      serverError: this.errorManifest.generic.serverError
    };
  }
}
