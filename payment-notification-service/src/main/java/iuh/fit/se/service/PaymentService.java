package iuh.fit.se.service;

import iuh.fit.se.dto.PaymentNotification;
import iuh.fit.se.dto.PaymentRequest;
import iuh.fit.se.dto.PaymentResponse;
import iuh.fit.se.dto.PaymentStatus;
import iuh.fit.se.entity.PaymentRecord;
import iuh.fit.se.exception.CustomException;
import iuh.fit.se.repository.PaymentRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class PaymentService {
    private static final Logger LOGGER = LoggerFactory.getLogger(PaymentService.class);

    private final RestTemplate restTemplate;
    private final PaymentRecordRepository paymentRecordRepository;
    private final PaymentNotificationHub notificationHub;

    @Value("${order.service.host}")
    private String orderServiceHost;

    @Value("${order.service.port:8083}")
    private int orderServicePort;

    public PaymentService(
            RestTemplate restTemplate,
            PaymentRecordRepository paymentRecordRepository,
            PaymentNotificationHub notificationHub
    ) {
        this.restTemplate = restTemplate;
        this.paymentRecordRepository = paymentRecordRepository;
        this.notificationHub = notificationHub;
    }

    public PaymentResponse processPayment(PaymentRequest request) {
        LOGGER.info("Payment status=PENDING for orderId={}, userId={}",
            request != null ? request.getOrderId() : null,
            request != null ? request.getUserId() : null);

        validateRequest(request);

        // Step 1: Validate order from Order Service before charging payment.
        OrderResponse order = getOrderById(request.getOrderId());
        validateOrderStatus(order);

        // Step 2: Simulate payment flow based on method.
        simulatePayment(request.getMethod());

        // Step 3: Update order status to SUCCESS with retry.
        updateOrderStatusWithRetry(request.getOrderId(), "SUCCESS");

        // Step 4: Persist payment record.
        PaymentRecord record = new PaymentRecord();
        record.setOrderId(request.getOrderId());
        record.setUserId(request.getUserId());
        record.setMethod(request.getMethod());
        record.setStatus(PaymentStatus.SUCCESS);
        paymentRecordRepository.save(record);

        // Step 5: Publish notification to frontend.
        PaymentNotification notification = new PaymentNotification(
            request.getOrderId(),
            request.getUserId(),
            PaymentStatus.SUCCESS,
            "Thanh toan thanh cong"
        );
        notificationHub.publish(notification);

        LOGGER.info("User {} đã đặt đơn #{} thành công", request.getUserId(), request.getOrderId());

        return new PaymentResponse(PaymentStatus.SUCCESS, "Payment successful");
    }

    private void validateRequest(PaymentRequest request) {
        if (request == null || request.getOrderId() == null || request.getUserId() == null || request.getMethod() == null) {
            throw new CustomException("INVALID_REQUEST", "orderId, userId, method are required");
        }

        String method = request.getMethod().trim().toUpperCase();
        if (!"COD".equals(method) && !"BANKING".equals(method)) {
            throw new CustomException("INVALID_PAYMENT_METHOD", "Method must be COD or BANKING");
        }

        request.setMethod(method);
    }

    private OrderResponse getOrderById(Long orderId) {
        String url = String.format("http://%s:%d/orders/%d", orderServiceHost, orderServicePort, orderId);

        try {
            ResponseEntity<OrderResponse> response = restTemplate.getForEntity(url, OrderResponse.class);
            if (response.getBody() == null) {
                throw new CustomException("ORDER_NOT_FOUND", "Order not found: " + orderId);
            }
            return response.getBody();
        } catch (HttpClientErrorException.NotFound ex) {
            throw new CustomException("ORDER_NOT_FOUND", "Order not found: " + orderId);
        }
    }

    private void validateOrderStatus(OrderResponse order) {
        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new CustomException("INVALID_ORDER_STATUS", "Order status must be PENDING to process payment");
        }
    }

    private void simulatePayment(String method) {
        if ("COD".equals(method)) {
            LOGGER.info("COD payment simulated: success");
            return;
        }

        try {
            Thread.sleep(1000);
            LOGGER.info("BANKING payment simulated after 1 second delay: success");
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new CustomException("PAYMENT_INTERRUPTED", "Payment simulation was interrupted");
        }
    }

    private void updateOrderStatusWithRetry(Long orderId, String status) {
        String url = String.format("http://%s:%d/orders/status/%d", orderServiceHost, orderServicePort, orderId);
        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(Map.of("status", status));

        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                restTemplate.exchange(url, HttpMethod.PUT, requestEntity, Void.class);
                LOGGER.info("Updated order {} status to {} on attempt {}", orderId, status, attempt);
                return;
            } catch (ResourceAccessException ex) {
                LOGGER.warn("Timeout while updating order status. attempt={}", attempt, ex);
                if (attempt == 3) {
                    throw ex;
                }
                sleepBeforeRetry();
            } catch (RestClientException ex) {
                LOGGER.warn("Failed to update order status. attempt={}", attempt, ex);
                if (attempt == 3) {
                    throw new CustomException("ORDER_UPDATE_FAILED", "Unable to update order status to " + status);
                }
                sleepBeforeRetry();
            }
        }
    }

    private void sleepBeforeRetry() {
        try {
            Thread.sleep(500);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new CustomException("RETRY_INTERRUPTED", "Retry was interrupted");
        }
    }

    private static class OrderResponse {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
