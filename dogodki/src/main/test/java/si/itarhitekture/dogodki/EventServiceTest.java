package si.itarhitekture.dogodki;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;
import si.itarhitekture.dogodki.app.EventService;
import si.itarhitekture.dogodki.domain.EventDocument;
import si.itarhitekture.dogodki.domain.EventType;
import si.itarhitekture.dogodki.infra.EventRepository;

import java.time.Instant;
import java.util.Map;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

  @Mock
  EventRepository repo;

  @InjectMocks
  EventService service;

  @Test
  void save_delegates_to_repo() {
    EventDocument e = new EventDocument(EventType.EXAMTERM_CREATED, "test", Map.of(), Instant.now());
    when(repo.save(e)).thenReturn(Mono.just(e));

    StepVerifier.create(service.save(e))
      .expectNext(e)
      .verifyComplete();

    verify(repo, times(1)).save(e);
  }

  @Test
  void list_all_delegates_to_repo() {
    when(repo.findAll()).thenReturn(Flux.empty());

    StepVerifier.create(service.list(null))
      .verifyComplete();

    verify(repo, times(1)).findAll();
  }

  @Test
  void list_by_type_delegates_to_repo() {
    when(repo.findByType(EventType.STUDENT_CREATED)).thenReturn(Flux.empty());

    StepVerifier.create(service.list(EventType.STUDENT_CREATED))
      .verifyComplete();

    verify(repo, times(1)).findByType(EventType.STUDENT_CREATED);
  }
}