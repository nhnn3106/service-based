import { CreateOrderDto } from "./dto/order.dto";
import { OrderService } from "./order.service";
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    getOrders(): Promise<{
        id: number;
        userId: number;
        foodId: number[];
        quantity: number;
        address: string;
        phone: string;
        paymentMethod: string;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
    }[]>;
    getOrderById(id: number): Promise<{
        id: number;
        userId: number;
        foodId: number[];
        quantity: number;
        address: string;
        phone: string;
        paymentMethod: string;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
    }>;
    createOrder(payload: CreateOrderDto): Promise<{
        orderId: string;
        total: number;
        etaMinutes: number;
    }>;
    updateOrderStatus(id: number, status: string): Promise<{
        message: string;
    }>;
}
