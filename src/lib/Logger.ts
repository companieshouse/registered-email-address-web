import { createLogger } from "@companieshouse/structured-logging-node";
import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";
import * as config from "../config";
const logger: ApplicationLogger = createLogger(process.env.APP_NAME ?? "");

// tslint:disable-next-line:no-console
console.log(`env.LOG_LEVEL set to ${config.LOG_LEVEL}`);

export default logger;
