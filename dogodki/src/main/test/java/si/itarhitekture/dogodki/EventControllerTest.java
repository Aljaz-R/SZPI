package si.itarhitekture.dogodki;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import si.itarhitekture.dogodki.api.EventController;
import si.itarhitekture.dogodki.app.EventService;
import si.itarhitekture.dogodki.domain.EventDocument;
import si.itarhitekture.dogodki.domain.EventType;
import si.itarhitekture.dogodki.messaging.EventEnvelope;
import si.itarhitekture.dogodki.messaging.JmsProducer;

import java.time.Instant;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@WebFluxTest(controllers = EventController.class)
class EventControllerTest {

  @Autowired
  WebTestClient client;

  @MockBean
  EventService service;

  @MockBean
  JmsProducer producer;

  @Test
  void health_ok() {
    client.get().uri("/api/v1/health")
      .exchange()
      .expectStatus().isOk()
      .expectBody()
      .jsonPath("$.status").isEqualTo("ok");
  }

  @Test
  void publish_queues_message() {
    var body = Map.of(
      "type", EventType.EXAMTERM_CREATED.name(),
      "source", "gateway-web",
      "payload", Map.of("predmetId", "OIT101")
    );

    client.post().uri("/api/v1/events/publish")
      .bodyValue(body)
      .exchange()
      .expectStatus().isAccepted()
      .expectBody()
      .jsonPath("$.queued").isEqualTo(true);

    verify(producer, times(1)).publish(any(EventEnvelope.class));
  }

  @Test
  void list_returns_events() {
    EventDocument e = new EventDocument(
      EventType.EXAMTERM_CREATED,
      "test",
      Map.of("predmetId", "OIT101"),
      Instant.parse("2026-01-01T00:00:00Z")
    );
    e.setId("abc");

    when(service.list(null)).thenReturn(Flux.just(e));

    client.get().uri("/api/v1/events")
      .exchange()
      .expectStatus().isOk()
      .expectBody()
      .jsonPath("$[0].id").isEqualTo("abc")
      .jsonPath("$[0].type").isEqualTo("EXAMTERM_CREATED");
  }

  @Test
  void get_returns_event() {
    EventDocument e = new EventDocument(
      EventType.STUDENT_CREATED,
      "test",
      Map.of("vpisna", "63111111"),
      Instant.parse("2026-01-01T00:00:00Z")
    );
    e.setId("id1");

    when(service.get("id1")).thenReturn(Mono.just(e));

    client.get().uri("/api/v1/events/id1")
      .exchange()
      .expectStatus().isOk()
      .expectBody()
      .jsonPath("$.id").isEqualTo("id1")
      .jsonPath("$.type").isEqualTo("STUDENT_CREATED");
  }
}