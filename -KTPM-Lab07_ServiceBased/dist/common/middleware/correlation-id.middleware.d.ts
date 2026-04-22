import { NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { RequestContextService } from "../context/request-context.service";
export declare class CorrelationIdMiddleware implements NestMiddleware {
    private readonly requestContext;
    constructor(requestContext: RequestContextService);
    use(req: Request, res: Response, next: NextFunction): void;
}
