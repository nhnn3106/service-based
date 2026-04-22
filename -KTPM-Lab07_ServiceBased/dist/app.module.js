"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const request_context_service_1 = require("./common/context/request-context.service");
const http_logging_interceptor_1 = require("./common/interceptors/http-logging.interceptor");
const json_logger_service_1 = require("./common/logger/json-logger.service");
const correlation_id_middleware_1 = require("./common/middleware/correlation-id.middleware");
const prisma_module_1 = require("./prisma/prisma.module");
const order_module_1 = require("./order/order.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(correlation_id_middleware_1.CorrelationIdMiddleware).forRoutes("*");
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.register({
                timeout: 5000,
                maxRedirects: 3,
            }),
            prisma_module_1.PrismaModule,
            order_module_1.OrderModule,
        ],
        providers: [
            request_context_service_1.RequestContextService,
            json_logger_service_1.JsonLoggerService,
            correlation_id_middleware_1.CorrelationIdMiddleware,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: http_logging_interceptor_1.HttpLoggingInterceptor,
            },
        ],
        exports: [json_logger_service_1.JsonLoggerService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map