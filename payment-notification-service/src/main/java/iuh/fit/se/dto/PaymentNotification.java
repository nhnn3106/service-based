package iuh.fit.se.dto;

import java.time.Instant;

public class PaymentNotification {
    private Long orderId;
    private Long userId;
    private PaymentStatus status;
    private String message;
    private String createdAt;

    public PaymentNotification() {
    }

    public PaymentNotification(Long orderId, Long userId, PaymentStatus status, String message) {
        this.orderId = orderId;
        this.userId = userId;
        this.status = status;
        this.message = message;
        this.createdAt = Instant.now().toString();
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
