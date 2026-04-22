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
var OrderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const axios_2 = require("axios");
const rxjs_1 = require("rxjs");
const json_logger_service_1 = require("../common/logger/json-logger.service");
const prisma_service_1 = require("../prisma/prisma.service");
let OrderService = OrderService_1 = class OrderService {
    constructor(prisma, httpService, logger) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.logger = logger;
        this.retryDelaysMs = [200, 400, 800];
        this.userServiceUrl = process.env.USER_SERVICE_URL ?? "http://172.16.42.129:3000";
        this.foodServiceUrl = process.env.FOOD_SERVICE_URL ?? "http://174.16.43.174:3003";
        this.paymentServiceUrl = process.env.PAYMENT_SERVICE_URL ?? "http://localhost:8084";
    }
    async getOrders() {
        return this.prisma.order.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async createOrder(payload) {
        const address = payload.address?.trim() || "Chua cap nhat";
        const phone = payload.phone?.trim() || "Chua cap nhat";
        const paymentMethod = payload.paymentMethod?.trim() || "unknown";
        const foodIds = payload.foodId;
        this.logger.logEvent("INFO", "Create order started", {
            event: "order.create.start",
            userId: payload.userId,
            foodIds,
            quantity: payload.quantity,
            paymentMethod,
        }, OrderService_1.name);
        await this.validateUser(payload.userId);
        const foods = await this.getFoodsInfo(foodIds);
        const itemsTotalPrice = foods.reduce((sum, food) => sum.add(new client_1.Prisma.Decimal(food.price)), new client_1.Prisma.Decimal(0));
        const totalPrice = itemsTotalPrice.mul(payload.quantity);
        const order = await this.prisma.order.create({
            data: {
                userId: payload.userId,
                foodId: foodIds,
                quantity: payload.quantity,
                address,
                phone,
                paymentMethod,
                totalPrice,
                status: client_1.OrderStatus.PENDING,
            },
        });
        const paymentMethodKey = paymentMethod.toLowerCase();
        const paymentMethodValue = paymentMethodKey === "bank" || paymentMethodKey === "banking"
            ? "BANKING"
            : "COD";
        await this.createPayment({
            orderId: order.id,
            userId: order.userId,
            method: paymentMethodValue,
        });
        this.logger.logEvent("INFO", "Create order success", {
            event: "order.create.success",
            orderId: order.id,
            userId: order.userId,
            foodIds: order.foodId,
            totalPrice: order.totalPrice.toString(),
        }, OrderService_1.name);
        return {
            orderId: String(order.id),
            total: order.totalPrice.toNumber(),
            etaMinutes: 30,
        };
    }
    async validateUser(userId) {
        try {
            const response = await this.getWithRetry(`${this.userServiceUrl}/api/users/${userId}`, "user-service", { userId });
            const data = this.unwrapData(response.data);
            if (!data?.id) {
                throw new common_1.UnauthorizedException("Invalid user credentials");
            }
            this.logger.logEvent("INFO", "User validation success", {
                event: "external.user.success",
                userId,
            }, OrderService_1.name);
            return data;
        }
        catch (error) {
            this.handleUserValidationError(error);
        }
    }
    async getOrderById(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${id} not found`);
        }
        return order;
    }
    async getFoodsInfo(foodIds) {
        return Promise.all(foodIds.map((foodId) => this.getFoodInfo(foodId)));
    }
    async getFoodInfo(foodId) {
        try {
            const response = await this.getWithRetry(`${this.foodServiceUrl}/foods/${foodId}`, "food-service", { foodId });
            const data = this.unwrapData(response.data);
            if (!data?.id || data.price === undefined || data.price === null) {
                throw new common_1.NotFoundException(`Food ${foodId} not found`);
            }
            this.logger.logEvent("INFO", "Food lookup success", {
                event: "external.food.success",
                foodId,
            }, OrderService_1.name);
            return data;
        }
        catch (error) {
            this.handleFoodLookupError(error, foodId);
        }
    }
    unwrapData(payload) {
        if (payload &&
            typeof payload === "object" &&
            "data" in payload &&
            payload.data !== undefined) {
            return payload.data;
        }
        return payload;
    }
    async updateOrderStatus(id, status) {
        const validStatuses = Object.values(client_1.OrderStatus);
        if (!validStatuses.includes(status)) {
            throw new common_1.BadGatewayException(`Invalid status value. Valid values are: ${validStatuses.join(", ")}`);
        }
        const order = await this.prisma.order.findUnique({
            where: { id },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${id} not found`);
        }
        await this.prisma.order.update({
            where: { id },
            data: { status: status },
        });
        return {
            message: `Order ${id} status updated to ${status}`,
        };
    }
    async createPayment(payload) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.paymentServiceUrl}/payments`, payload));
            this.logger.logEvent("INFO", "Payment created", {
                event: "payment.create.success",
                orderId: payload.orderId,
                userId: payload.userId,
                status: response.data?.status,
            }, OrderService_1.name);
            return response.data;
        }
        catch (error) {
            this.logger.logEvent("ERROR", "Payment creation failed", {
                event: "payment.create.failed",
                orderId: payload.orderId,
                userId: payload.userId,
                reason: this.extractAxiosMessage(error),
            }, OrderService_1.name);
            throw new common_1.BadGatewayException("Payment service is unavailable, please try again");
        }
    }
    async getWithRetry(url, serviceName, metadata) {
        return (0, rxjs_1.firstValueFrom)(this.httpService.get(url).pipe((0, rxjs_1.retry)({
            count: this.retryDelaysMs.length,
            delay: (error, retryCount) => {
                if (!this.isRetryableError(error)) {
                    throw error;
                }
                const delayMs = this.retryDelaysMs[retryCount - 1] ??
                    this.retryDelaysMs[this.retryDelaysMs.length - 1];
                this.logger.logEvent("WARN", "External call failed, retrying", {
                    event: "external.retry",
                    serviceName,
                    retryAttempt: retryCount,
                    maxRetries: this.retryDelaysMs.length,
                    delayMs,
                    reason: this.extractAxiosMessage(error),
                    ...metadata,
                }, OrderService_1.name);
                return (0, rxjs_1.timer)(delayMs);
            },
        })));
    }
    isRetryableError(error) {
        if (!(error instanceof axios_2.AxiosError)) {
            return false;
        }
        if (!error.response) {
            return true;
        }
        return error.response.status >= 500 || error.response.status === 429;
    }
    extractAxiosMessage(error) {
        if (error instanceof axios_2.AxiosError) {
            return error.message;
        }
        if (error instanceof Error) {
            return error.message;
        }
        return "Unknown error";
    }
    handleUserValidationError(error) {
        this.logger.logEvent("ERROR", "User validation failed", {
            event: "external.user.failed",
            reason: this.extractAxiosMessage(error),
        }, OrderService_1.name);
        if (error instanceof common_1.UnauthorizedException) {
            throw error;
        }
        if (error instanceof axios_2.AxiosError) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new common_1.UnauthorizedException("User is not authorized");
            }
            if (error.response?.status === 404) {
                throw new common_1.NotFoundException("User not found");
            }
            throw new common_1.BadGatewayException("User service is unavailable");
        }
        throw error;
    }
    handleFoodLookupError(error, foodId) {
        this.logger.logEvent("ERROR", "Food lookup failed", {
            event: "external.food.failed",
            foodId,
            reason: this.extractAxiosMessage(error),
        }, OrderService_1.name);
        if (error instanceof common_1.NotFoundException) {
            throw error;
        }
        if (error instanceof axios_2.AxiosError) {
            if (error.response?.status === 404) {
                throw new common_1.NotFoundException(`Food ${foodId} not found`);
            }
            throw new common_1.BadGatewayException("Food service is unavailable");
        }
        throw error;
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = OrderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        axios_1.HttpService,
        json_logger_service_1.JsonLoggerService])
], OrderService);
//# sourceMappingURL=order.service.js.map