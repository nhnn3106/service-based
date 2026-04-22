import { HttpService } from "@nestjs/axios";
import {
  BadGatewayException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { OrderStatus, Prisma } from "@prisma/client";
import { AxiosError, AxiosResponse } from "axios";
import { firstValueFrom, retry, timer } from "rxjs";
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

type PaymentRequest = {
  orderId: number;
  userId: number;
  method: "COD" | "BANKING";
};

type PaymentResponse = {
  status: string;
  message: string;
};

type OrderResult = {
  orderId: string;
  total: number;
  etaMinutes: number;
};

@Injectable()
export class OrderService {
  private readonly retryDelaysMs = [200, 400, 800];
  private readonly userServiceUrl =
    process.env.USER_SERVICE_URL ?? "http://172.16.42.129:3000";
  private readonly foodServiceUrl =
    process.env.FOOD_SERVICE_URL ?? "http://174.16.43.174:3003";
  private readonly paymentServiceUrl =
    process.env.PAYMENT_SERVICE_URL ?? "http://localhost:8084";

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly logger: JsonLoggerService,
  ) { }

  async getOrders() {
    return this.prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async createOrder(payload: CreateOrderDto): Promise<OrderResult> {
    const address = payload.address?.trim() || "Chua cap nhat";
    const phone = payload.phone?.trim() || "Chua cap nhat";
    const paymentMethod = payload.paymentMethod?.trim() || "unknown";
    const foodIds = payload.foodId;

    this.logger.logEvent(
      "INFO",
      "Create order started",
      {
        event: "order.create.start",
        userId: payload.userId,
        foodIds,
        quantity: payload.quantity,
        paymentMethod,
      },
      OrderService.name,
    );

    await this.validateUser(payload.userId);
    const foods = await this.getFoodsInfo(foodIds);

    const itemsTotalPrice = foods.reduce(
      (sum, food) => sum.add(new Prisma.Decimal(food.price)),
      new Prisma.Decimal(0),
    );
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
        status: OrderStatus.PENDING,
      },
    });

    const paymentMethodKey = paymentMethod.toLowerCase();
    const paymentMethodValue: PaymentRequest["method"] =
      paymentMethodKey === "bank" || paymentMethodKey === "banking"
        ? "BANKING"
        : "COD";

    await this.createPayment({
      orderId: order.id,
      userId: order.userId,
      method: paymentMethodValue,
    });

    this.logger.logEvent(
      "INFO",
      "Create order success",
      {
        event: "order.create.success",
        orderId: order.id,
        userId: order.userId,
        foodIds: order.foodId,
        totalPrice: order.totalPrice.toString(),
      },
      OrderService.name,
    );

    return {
      orderId: String(order.id),
      total: order.totalPrice.toNumber(),
      etaMinutes: 30,
    };
  }

  async validateUser(userId: number): Promise<UserResponse> {
    try {
      const response = await this.getWithRetry<UserResponse>(
        `${this.userServiceUrl}/api/users/${userId}`,
        "user-service",
        { userId },
      );
      const data = this.unwrapData<UserResponse>(response.data);

      if (!data?.id) {
        throw new UnauthorizedException("Invalid user credentials");
      }

      this.logger.logEvent(
        "INFO",
        "User validation success",
        {
          event: "external.user.success",
          userId,
        },
        OrderService.name,
      );

      return data;
    } catch (error) {
      this.handleUserValidationError(error);
    }
  }

  async getOrderById(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }

  async getFoodsInfo(foodIds: number[]): Promise<FoodResponse[]> {
    return Promise.all(foodIds.map((foodId) => this.getFoodInfo(foodId)));
  }

  async getFoodInfo(foodId: number): Promise<FoodResponse> {
    try {
      const response = await this.getWithRetry<FoodResponse>(
        `${this.foodServiceUrl}/foods/${foodId}`,
        "food-service",
        { foodId },
      );
      const data = this.unwrapData<FoodResponse>(response.data);

      if (!data?.id || data.price === undefined || data.price === null) {
        throw new NotFoundException(`Food ${foodId} not found`);
      }

      this.logger.logEvent(
        "INFO",
        "Food lookup success",
        {
          event: "external.food.success",
          foodId,
        },
        OrderService.name,
      );

      return data;
    } catch (error) {
      this.handleFoodLookupError(error, foodId);
    }
  }

  private unwrapData<T>(payload: T | { data: T }): T {
    if (
      payload &&
      typeof payload === "object" &&
      "data" in payload &&
      (payload as { data?: T }).data !== undefined
    ) {
      return (payload as { data: T }).data;
    }

    return payload as T;
  }

  async updateOrderStatus(id: number, status: string) {
    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status as OrderStatus)) {
      throw new BadGatewayException(
        `Invalid status value. Valid values are: ${validStatuses.join(", ")}`,
      );
    }
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    await this.prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    });

    return {
      message: `Order ${id} status updated to ${status}`,
    };
  }

  private async createPayment(payload: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<PaymentResponse>(
          `${this.paymentServiceUrl}/payments`,
          payload,
        ),
      );

      this.logger.logEvent(
        "INFO",
        "Payment created",
        {
          event: "payment.create.success",
          orderId: payload.orderId,
          userId: payload.userId,
          status: response.data?.status,
        },
        OrderService.name,
      );

      return response.data;
    } catch (error) {
      this.logger.logEvent(
        "ERROR",
        "Payment creation failed",
        {
          event: "payment.create.failed",
          orderId: payload.orderId,
          userId: payload.userId,
          reason: this.extractAxiosMessage(error),
        },
        OrderService.name,
      );

      throw new BadGatewayException(
        "Payment service is unavailable, please try again",
      );
    }
  }

  private async getWithRetry<T>(
    url: string,
    serviceName: string,
    metadata: Record<string, unknown>,
  ): Promise<AxiosResponse<T>> {
    return firstValueFrom(
      this.httpService.get<T>(url).pipe(
        retry({
          count: this.retryDelaysMs.length,
          delay: (error, retryCount) => {
            if (!this.isRetryableError(error)) {
              throw error;
            }

            const delayMs =
              this.retryDelaysMs[retryCount - 1] ??
              this.retryDelaysMs[this.retryDelaysMs.length - 1];

            this.logger.logEvent(
              "WARN",
              "External call failed, retrying",
              {
                event: "external.retry",
                serviceName,
                retryAttempt: retryCount,
                maxRetries: this.retryDelaysMs.length,
                delayMs,
                reason: this.extractAxiosMessage(error),
                ...metadata,
              },
              OrderService.name,
            );

            return timer(delayMs);
          },
        }),
      ),
    );
  }

  private isRetryableError(error: unknown): boolean {
    if (!(error instanceof AxiosError)) {
      return false;
    }

    if (!error.response) {
      return true;
    }

    return error.response.status >= 500 || error.response.status === 429;
  }

  private extractAxiosMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Unknown error";
  }

  private handleUserValidationError(error: unknown): never {
    this.logger.logEvent(
      "ERROR",
      "User validation failed",
      {
        event: "external.user.failed",
        reason: this.extractAxiosMessage(error),
      },
      OrderService.name,
    );

    if (error instanceof UnauthorizedException) {
      throw error;
    }

    if (error instanceof AxiosError) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new UnauthorizedException("User is not authorized");
      }

      if (error.response?.status === 404) {
        throw new NotFoundException("User not found");
      }

      throw new BadGatewayException("User service is unavailable");
    }

    throw error;
  }

  private handleFoodLookupError(error: unknown, foodId: number): never {
    this.logger.logEvent(
      "ERROR",
      "Food lookup failed",
      {
        event: "external.food.failed",
        foodId,
        reason: this.extractAxiosMessage(error),
      },
      OrderService.name,
    );

    if (error instanceof NotFoundException) {
      throw error;
    }

    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`Food ${foodId} not found`);
      }

      throw new BadGatewayException("Food service is unavailable");
    }

    throw error;
  }
}
