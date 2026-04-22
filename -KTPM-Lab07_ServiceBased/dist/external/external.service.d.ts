import { HttpService } from "@nestjs/axios";
export declare class ExternalService {
    private readonly httpService;
    private readonly userServiceUrl;
    private readonly foodServiceUrl;
    constructor(httpService: HttpService);
    validateUser(userId: number): Promise<void>;
    getFoodInfo(foodId: number): Promise<{
        id: number;
        price: number | string;
    }>;
}
