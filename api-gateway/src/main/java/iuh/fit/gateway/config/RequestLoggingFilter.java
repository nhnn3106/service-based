package iuh.fit.gateway.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class RequestLoggingFilter implements GlobalFilter, Ordered {
    private static final Logger LOGGER = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        long startTime = System.currentTimeMillis();
        String requestId = exchange.getRequest().getHeaders().getFirst("X-Request-Id");
        if (requestId == null || requestId.isBlank()) {
            requestId = UUID.randomUUID().toString();
        }

        ServerHttpRequest mutatedRequest = exchange.getRequest()
                .mutate()
                .header("X-Request-Id", requestId)
                .build();

        exchange.getResponse().getHeaders().set("X-Request-Id", requestId);

        String finalRequestId = requestId;
        return chain.filter(exchange.mutate().request(mutatedRequest).build())
                .doFinally((signalType) -> {
                    long duration = System.currentTimeMillis() - startTime;
                    HttpStatusCode status = exchange.getResponse().getStatusCode();
                    String statusValue = status != null ? String.valueOf(status.value()) : "NA";
                    LOGGER.info(
                            "gateway requestId={} method={} path={} status={} durationMs={}",
                            finalRequestId,
                            mutatedRequest.getMethod(),
                            mutatedRequest.getURI().getPath(),
                            statusValue,
                            duration
                    );
                });
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
