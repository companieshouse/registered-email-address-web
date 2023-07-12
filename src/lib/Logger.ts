import { createLogger } from "@companieshouse/structured-logging-node";
import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";

// tslint:disable-next-line:no-console
console.log(`env.LOG_LEVEL set to ${process.env.LOG_LEVEL}`);

export const logger: ApplicationLogger = createLogger(process.env.APP_NAME ?? "registered-email-address-web");

export const createAndLogError = (description: string): Error => {
  const error = new Error(description);
  logger.error(`${error.stack}`);
  return error;
};

export const createAndLogServiceUnavailable = (description: string): Error => {
  const error = new Error(description + " - Service Unavailable");
  logger.error(`${error.stack}`);
  return error;
};

