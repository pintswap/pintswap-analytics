import "setimmediate";
import { Logger } from "winston";
declare const createLogger: (proc?: string) => Logger;
declare const logger: Logger;
export { createLogger, Logger, logger };
