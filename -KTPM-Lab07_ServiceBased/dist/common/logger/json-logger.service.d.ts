import { LoggerService } from "@nestjs/common";
import { RequestContextService } from "../context/request-context.service";
type AppLogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG" | "VERBOSE";
export declare class JsonLoggerService implements LoggerService {
    private readonly requestContext;
    constructor(requestContext: RequestContextService);
    log(message: unknown, context?: string): void;
    error(message: unknown, trace?: string, context?: string): void;
    warn(message: unknown, context?: string): void;
    debug(message: unknown, context?: string): void;
    verbose(message: unknown, context?: string): void;
    logEvent(level: AppLogLevel, message: string, metadata?: Record<string, unknown>, context?: string): void;
    private write;
}
export {};
