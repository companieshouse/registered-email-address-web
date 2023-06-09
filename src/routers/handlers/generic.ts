// Generic handler is the base handler that is extended by all other handlers
// It contains methods that are common to multiple route handlers
import { BaseHttpController } from "inversify-express-utils";
import "reflect-metadata";

import errorManifest from "./../../lib/utils/error_manifests/default";

export abstract class GenericHandler extends BaseHttpController {

  viewData: any;
  errorManifest: any;

  constructor () {
    super();
    this.errorManifest = errorManifest;
    this.viewData = {};
    this.viewData.signoutBanner = true;
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
