package iuh.fit.gateway.config;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class DeduplicateCorsFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            HttpHeaders headers = exchange.getResponse().getHeaders();
            removeDuplicateHeader(headers, "Access-Control-Allow-Origin");
            removeDuplicateHeader(headers, "Access-Control-Allow-Credentials");
            removeDuplicateHeader(headers, "Access-Control-Allow-Methods");
            removeDuplicateHeader(headers, "Access-Control-Allow-Headers");
        }));
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE; // Chạy sau cùng để dọn dẹp các header thừa
    }

    private void removeDuplicateHeader(HttpHeaders headers, String headerName) {
        List<String> values = headers.get(headerName);
        if (values != null && values.size() > 1) {
            // Lấy giá trị đầu tiên (thường là giá trị đúng từ service con hoặc gateway)
            String firstValue = values.getFirst();

            // ĐÚNG: Sử dụng .set() thay vì .remove() và .add()
            // Phương thức set() sẽ xóa sạch các giá trị cũ và chỉ để lại 1 giá trị này.
            headers.set(headerName, firstValue);
        }
    }

}