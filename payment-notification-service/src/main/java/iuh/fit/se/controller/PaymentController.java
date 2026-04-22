package iuh.fit.se.controller;

import iuh.fit.se.dto.PaymentRequest;
import iuh.fit.se.dto.PaymentResponse;
import iuh.fit.se.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PaymentController {
    private static final Logger LOGGER = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/payments")
    public ResponseEntity<PaymentResponse> processPayment(@RequestBody PaymentRequest request) {
        LOGGER.info("Received POST /payments request: orderId={}, userId={}, method={}",
            request != null ? request.getOrderId() : null,
            request != null ? request.getUserId() : null,
            request != null ? request.getMethod() : null);

        PaymentResponse response = paymentService.processPayment(request);
        LOGGER.info("Sending POST /payments response: status={}, message={}",
            response.getStatus(), response.getMessage());

        return ResponseEntity.ok(response);
    }
}
