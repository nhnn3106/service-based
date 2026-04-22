import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { JsonLoggerService } from "../logger/json-logger.service";
import { RequestContextService } from "../context/request-context.service";
export declare class HttpLoggingInterceptor implements NestInterceptor {
    private readonly logger;
    private readonly requestContext;
    constructor(logger: JsonLoggerService, requestContext: RequestContextService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
    private extractStatusCode;
    private extractErrorMessage;
}
