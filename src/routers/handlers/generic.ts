// Generic handler is the base handler that is extended by all other handlers
// It contains methods that are common to multiple route handlers
import { StatusCodes } from "http-status-codes";
import { BaseHttpController } from "inversify-express-utils";
import "reflect-metadata";

import errorManifest from "./../../lib/utils/error_manifests/default";

export abstract class GenericHandler<T extends object = {}> extends BaseHttpController {

    viewData: any;
    errorManifest: any;

    constructor () {
        super();
        this.errorManifest = errorManifest;
        this.viewData = {};
    }

    processHandlerException (err: any): Object {
        if (err.name === "VALIDATION_ERRORS") {
            return err.stack;
        }
        return {
            serverError: this.errorManifest.generic.serverError
        };
    }
};
