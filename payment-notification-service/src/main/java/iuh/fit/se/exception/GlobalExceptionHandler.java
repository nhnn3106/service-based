package iuh.fit.se.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import iuh.fit.se.dto.PaymentStatus;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<Map<String, String>> handleCustomException(CustomException exception) {
        HttpStatus status = mapStatus(exception.getError());
        LOGGER.warn("API error response: status={}, error={}, message={}", status.value(), exception.getError(), exception.getMessage());
        return ResponseEntity.status(status).body(errorBody(exception.getError(), exception.getMessage()));
    }

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<Map<String, String>> handleTimeout(ResourceAccessException exception) {
        LOGGER.warn("API error response: status=504, error=REST_TEMPLATE_TIMEOUT, message=Request to Order Service timed out");
        return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT)
                .body(errorBody("REST_TEMPLATE_TIMEOUT", "Request to Order Service timed out"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleUnexpected(Exception exception) {
        LOGGER.error("API error response: status=500, error=INTERNAL_SERVER_ERROR, message={}", exception.getMessage(), exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorBody("INTERNAL_SERVER_ERROR", exception.getMessage()));
    }

    private Map<String, String> errorBody(String error, String message) {
        Map<String, String> body = new HashMap<>();
        body.put("status", PaymentStatus.FAIL.name());
        body.put("error", error);
        body.put("message", message);
        return body;
    }

    private HttpStatus mapStatus(String error) {
        return switch (error) {
            case "ORDER_NOT_FOUND" -> HttpStatus.NOT_FOUND;
            case "INVALID_ORDER_STATUS", "INVALID_PAYMENT_METHOD" -> HttpStatus.BAD_REQUEST;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
    }
}
