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
exports.ExternalService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const axios_2 = require("axios");
const rxjs_1 = require("rxjs");
let ExternalService = class ExternalService {
    constructor(httpService) {
        this.httpService = httpService;
        this.userServiceUrl = process.env.USER_SERVICE_URL ?? "http://172.16.42.129:3000";
        this.foodServiceUrl = process.env.FOOD_SERVICE_URL ?? "http://174.16.43.174:3003";
    }
    async validateUser(userId) {
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.userServiceUrl}/users/${userId}`));
        }
        catch (error) {
            if (error instanceof axios_2.AxiosError) {
                if (error.response?.status === 401 || error.response?.status === 403) {
                    throw new common_1.UnauthorizedException("User is not authorized");
                }
                if (error.response?.status === 404) {
                    throw new common_1.NotFoundException("User not found");
                }
            }
            throw new common_1.BadGatewayException("User service is unavailable");
        }
    }
    async getFoodInfo(foodId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.foodServiceUrl}/foods/${foodId}`));
            const payload = response.data;
            const data = payload && typeof payload === "object" && "data" in payload
                ? payload.data
                : payload;
            if (!data || data.price === undefined || data.price === null) {
                throw new common_1.NotFoundException(`Food ${foodId} not found`);
            }
            return data;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            if (error instanceof axios_2.AxiosError && error.response?.status === 404) {
                throw new common_1.NotFoundException(`Food ${foodId} not found`);
            }
            throw new common_1.BadGatewayException("Food service is unavailable");
        }
    }
};
exports.ExternalService = ExternalService;
exports.ExternalService = ExternalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], ExternalService);
//# sourceMappingURL=external.service.js.map