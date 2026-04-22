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
exports.CorrelationIdMiddleware = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const request_context_service_1 = require("../context/request-context.service");
let CorrelationIdMiddleware = class CorrelationIdMiddleware {
    constructor(requestContext) {
        this.requestContext = requestContext;
    }
    use(req, res, next) {
        const headerValue = req.header("x-correlation-id");
        const correlationId = headerValue && headerValue.trim().length > 0 ? headerValue : (0, node_crypto_1.randomUUID)();
        res.setHeader("x-correlation-id", correlationId);
        this.requestContext.run(correlationId, next);
    }
};
exports.CorrelationIdMiddleware = CorrelationIdMiddleware;
exports.CorrelationIdMiddleware = CorrelationIdMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [request_context_service_1.RequestContextService])
], CorrelationIdMiddleware);
//# sourceMappingURL=correlation-id.middleware.js.map