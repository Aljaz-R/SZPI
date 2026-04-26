package si.itarhitekture.dogodki.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import si.itarhitekture.dogodki.app.EventService;
import si.itarhitekture.dogodki.domain.EventDocument;
import si.itarhitekture.dogodki.domain.EventType;
import si.itarhitekture.dogodki.messaging.EventEnvelope;
import si.itarhitekture.dogodki.messaging.JmsProducer;

@RestController
@RequestMapping("/api/v1")
public class EventController {
  private final EventService service;
  private final JmsProducer producer;

  public EventController(EventService service, JmsProducer producer) {
    this.service = service;
    this.producer = producer;
  }

  @GetMapping("/health")
  public Mono<Object> health() {
    return Mono.just(new java.util.HashMap<>() {{ put("status","ok"); }});
  }

  @GetMapping("/events")
  public Flux<EventDocument> list(@RequestParam(name = "type", required = false) EventType type) {
    return service.list(type);
  }

  @GetMapping("/events/{id}")
  public Mono<EventDocument> get(@PathVariable String id) {
    return service.get(id);
  }

  // Endpoint samo za demonstracijo brokerja:
  // Postman -> publish -> JMS -> consumer shrani v Mongo -> GET /events
  @PostMapping("/events/publish")
  @ResponseStatus(HttpStatus.ACCEPTED)
  public Mono<Object> publish(@RequestBody EventEnvelope req) {
    return Mono.fromRunnable(() -> producer.publish(req))
      .thenReturn(new java.util.HashMap<>() {{ put("queued", true); }});
  }
}