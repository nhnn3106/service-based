package iuh.fit.se.controller;

import iuh.fit.se.service.PaymentNotificationHub;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/payments")
public class PaymentNotificationController {
    private final PaymentNotificationHub notificationHub;

    public PaymentNotificationController(PaymentNotificationHub notificationHub) {
        this.notificationHub = notificationHub;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestParam(name = "userId", required = false) Long userId) {
        return notificationHub.subscribe(userId);
    }
}
