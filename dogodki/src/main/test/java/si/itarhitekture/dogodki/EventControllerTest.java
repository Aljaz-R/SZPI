package si.itarhitekture.dogodki;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.test.web.reactive.server.WebTestClient;
import si.itarhitekture.dogodki.domain.EventType;

import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
class EventControllerTest {

  @Autowired
  WebTestClient client;

  @MockBean
  JmsTemplate jmsTemplate; // test ne rabi brokerja

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

    verify(jmsTemplate, atLeastOnce()).convertAndSend(anyString(), anyString());
  }
}