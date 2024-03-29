// Generic handler is the base handler that is extended by all other handlers
// It contains methods that are common to multiple route handlers
import { BaseHttpController } from "inversify-express-utils";
import "reflect-metadata";
import error_manifest from "../../utils/error/error_manifest";
import {FEEDBACK_LINK, SESSION_COUNTDOWN, SESSION_TIMEOUT} from "../../config";

export abstract class GenericHandler extends BaseHttpController {

  viewData: any;
  errorManifest: any;

  constructor () {
    super();
    this.viewData = {};
    this.viewData.eventType = "event";
    this.viewData.signoutBanner = true;
    this.viewData.sessionTimeout = SESSION_TIMEOUT;
    this.viewData.sessionCountdown = SESSION_COUNTDOWN;
    this.viewData.feedback = FEEDBACK_LINK;
    this.errorManifest = error_manifest;
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
