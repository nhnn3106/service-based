import { HttpService } from "@nestjs/axios";
import { Prisma } from "@prisma/client";
import { JsonLoggerService } from "../common/logger/json-logger.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/order.dto";
type UserResponse = {
    id: number;
};
type FoodResponse = {
    id: number;
    price: number | string;
};
type OrderResult = {
    orderId: string;
    total: number;
    etaMinutes: number;
};
export declare class OrderService {
    private readonly prisma;
    private readonly httpService;
    private readonly logger;
    private readonly retryDelaysMs;
    private readonly userServiceUrl;
    private readonly foodServiceUrl;
    private readonly paymentServiceUrl;
    constructor(prisma: PrismaService, httpService: HttpService, logger: JsonLoggerService);
    getOrders(): Promise<{
        id: number;
        userId: number;
        foodId: number[];
        quantity: number;
        address: string;
        phone: string;
        paymentMethod: string;
        totalPrice: Prisma.Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
    }[]>;
    createOrder(payload: CreateOrderDto): Promise<OrderResult>;
    validateUser(userId: number): Promise<UserResponse>;
    getOrderById(id: number): Promise<{
        id: number;
        userId: number;
        foodId: number[];
        quantity: number;
        address: string;
        phone: string;
        paymentMethod: string;
        totalPrice: Prisma.Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
    }>;
    getFoodsInfo(foodIds: number[]): Promise<FoodResponse[]>;
    getFoodInfo(foodId: number): Promise<FoodResponse>;
    private unwrapData;
    updateOrderStatus(id: number, status: string): Promise<{
        message: string;
    }>;
    private createPayment;
    private getWithRetry;
    private isRetryableError;
    private extractAxiosMessage;
    private handleUserValidationError;
    private handleFoodLookupError;
}
export {};
