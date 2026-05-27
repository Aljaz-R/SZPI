package si.itarhitekture.dogodki.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Instant;

import si.itarhitekture.dogodki.domain.EventDocument;
import si.itarhitekture.dogodki.infra.EventRepository;

@Component
public class JmsConsumer {

  private static final Logger log = LoggerFactory.getLogger(JmsConsumer.class);

  private final ObjectMapper mapper;
  private final EventRepository repo;

  public JmsConsumer(ObjectMapper mapper, EventRepository repo) {
    this.mapper = mapper;
    this.repo = repo;
  }

  @JmsListener(destination = "${dogodki.queue:events.v1}")
  public void onMessage(String raw) {
    try {
      EventEnvelope env = mapper.readValue(raw, EventEnvelope.class);

      EventDocument doc = new EventDocument();
      doc.setEventId(env.getEventId());     // če imaš record: env.eventId()
      doc.setType(env.getType());           // če imaš record: env.type()
      doc.setSource(env.getSource());       // če imaš record: env.source()
      doc.setPayload(env.getPayload());     // če imaš record: env.payload()
      doc.setCreatedAt(Instant.now());

      repo.save(doc)
          .doOnSuccess(saved -> log.info("Saved eventId={}", saved.getEventId()))
          .onErrorResume(DuplicateKeyException.class, e -> {
            log.info("Duplicate eventId={} -> ignore", doc.getEventId());
            return Mono.empty();
          })
          .subscribe();

    } catch (Exception e) {
      log.error("Failed to process message", e);
    }
  }
}