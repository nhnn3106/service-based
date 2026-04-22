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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonLoggerService = void 0;
const common_1 = require("@nestjs/common");
const request_context_service_1 = require("../context/request-context.service");
let JsonLoggerService = class JsonLoggerService {
    constructor(requestContext) {
        this.requestContext = requestContext;
    }
    log(message, context) {
        this.write("INFO", message, context);
    }
    error(message, trace, context) {
        this.write("ERROR", message, context, undefined, trace);
    }
    warn(message, context) {
        this.write("WARN", message, context);
    }
    debug(message, context) {
        this.write("DEBUG", message, context);
    }
    verbose(message, context) {
        this.write("VERBOSE", message, context);
    }
    logEvent(level, message, metadata = {}, context) {
        this.write(level, message, context, metadata);
    }
    write(level, message, context = "Application", metadata = {}, trace) {
        const payload = {
            timestamp: new Date().toISOString(),
            level,
            context,
            correlationId: this.requestContext.getCorrelationId(),
            message,
            ...metadata,
        };
        if (trace) {
            payload.trace = trace;
        }
        const line = `${JSON.stringify(payload)}\n`;
        if (level === "ERROR") {
            process.stderr.write(line);
            return;
        }
        process.stdout.write(line);
    }
};
exports.JsonLoggerService = JsonLoggerService;
exports.JsonLoggerService = JsonLoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [request_context_service_1.RequestContextService])
], JsonLoggerService);
//# sourceMappingURL=json-logger.service.js.map