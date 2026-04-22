"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var HttpLoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpLoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const json_logger_service_1 = require("../logger/json-logger.service");
const request_context_service_1 = require("../context/request-context.service");
let HttpLoggingInterceptor = HttpLoggingInterceptor_1 = class HttpLoggingInterceptor {
    constructor(logger, requestContext) {
        this.logger = logger;
        this.requestContext = requestContext;
    }
    intercept(context, next) {
        if (context.getType() !== "http") {
            return next.handle();
        }
        const httpContext = context.switchToHttp();
        const req = httpContext.getRequest();
        const res = httpContext.getResponse();
        const startedAt = Date.now();
        this.logger.logEvent("INFO", "Incoming request", {
            event: "http.request.start",
            method: req.method,
            path: req.originalUrl ?? req.url,
            correlationId: this.requestContext.getCorrelationId(),
        }, HttpLoggingInterceptor_1.name);
        return next.handle().pipe((0, rxjs_1.tap)(() => {
            this.logger.logEvent("INFO", "Request completed", {
                event: "http.request.end",
                method: req.method,
                path: req.originalUrl ?? req.url,
                statusCode: res.statusCode,
                durationMs: Date.now() - startedAt,
                correlationId: this.requestContext.getCorrelationId(),
            }, HttpLoggingInterceptor_1.name);
        }), (0, rxjs_1.catchError)((error) => {
            this.logger.logEvent("ERROR", "Request failed", {
                event: "http.request.error",
                method: req.method,
                path: req.originalUrl ?? req.url,
                statusCode: this.extractStatusCode(error),
                durationMs: Date.now() - startedAt,
                correlationId: this.requestContext.getCorrelationId(),
                errorMessage: this.extractErrorMessage(error),
            }, HttpLoggingInterceptor_1.name);
            return (0, rxjs_1.throwError)(() => error);
        }));
    }
    extractStatusCode(error) {
        if (error instanceof common_1.HttpException) {
            return error.getStatus();
        }
        return 500;
    }
    extractErrorMessage(error) {
        if (error instanceof Error) {
            return error.message;
        }
        return "Unknown error";
    }
};
exports.HttpLoggingInterceptor = HttpLoggingInterceptor;
exports.HttpLoggingInterceptor = HttpLoggingInterceptor = HttpLoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_logger_service_1.JsonLoggerService,
        request_context_service_1.RequestContextService])
], HttpLoggingInterceptor);
//# sourceMappingURL=http-logging.interceptor.js.map