package si.itarhitekture.dogodki.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;
import reactor.core.scheduler.Schedulers;
import si.itarhitekture.dogodki.app.EventService;
import si.itarhitekture.dogodki.domain.EventDocument;

import java.time.Instant;

@Component
public class JmsConsumer {
  private static final Logger log = LoggerFactory.getLogger(JmsConsumer.class);

  private final ObjectMapper om;
  private final EventService service;

  public JmsConsumer(ObjectMapper om, EventService service) {
    this.om = om;
    this.service = service;
  }

  @JmsListener(destination = "${dogodki.queue}")
  public void onMessage(String msg) {
    try {
      EventEnvelope env = om.readValue(msg, EventEnvelope.class);
      EventDocument doc = new EventDocument(env.type(), env.source(), env.payload(), Instant.now());

      service.save(doc)
        .doOnSuccess(saved -> log.info("event saved id={} type={}", saved.getId(), saved.getType()))
        .doOnError(e -> log.error("failed to save event", e))
        .subscribeOn(Schedulers.boundedElastic())
        .subscribe();

    } catch (Exception e) {
      log.error("failed to process message", e);
    }
  }
}