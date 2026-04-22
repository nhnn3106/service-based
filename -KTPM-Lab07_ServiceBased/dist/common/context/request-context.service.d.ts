export declare class RequestContextService {
    private readonly storage;
    run(correlationId: string, callback: () => void): void;
    getCorrelationId(): string | null;
}
