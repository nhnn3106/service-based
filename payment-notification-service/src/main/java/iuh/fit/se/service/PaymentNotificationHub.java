package iuh.fit.se.service;

import iuh.fit.se.dto.PaymentNotification;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class PaymentNotificationHub {
    private final CopyOnWriteArrayList<EmitterWrapper> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(0L);
        EmitterWrapper wrapper = new EmitterWrapper(userId, emitter);
        emitters.add(wrapper);

        emitter.onCompletion(() -> emitters.remove(wrapper));
        emitter.onTimeout(() -> emitters.remove(wrapper));
        emitter.onError((ex) -> emitters.remove(wrapper));

        return emitter;
    }

    public void publish(PaymentNotification notification) {
        for (EmitterWrapper wrapper : emitters) {
            if (wrapper.userId != null && !wrapper.userId.equals(notification.getUserId())) {
                continue;
            }
            try {
                wrapper.emitter.send(SseEmitter.event().name("payment").data(notification));
            } catch (IOException ex) {
                emitters.remove(wrapper);
            }
        }
    }

    private static class EmitterWrapper {
        private final Long userId;
        private final SseEmitter emitter;

        private EmitterWrapper(Long userId, SseEmitter emitter) {
            this.userId = userId;
            this.emitter = emitter;
        }
    }
}
