package iuh.fit.se.dto;

public class PaymentRequest {
    private Long orderId;
    private Long userId;
    private String method;

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

    public String getMethod() {
        return method;
    }

    // method phải là "COD" hoặc "BANKING" 
    public void setMethod(String method) {
        this.method = method;
    }
}
