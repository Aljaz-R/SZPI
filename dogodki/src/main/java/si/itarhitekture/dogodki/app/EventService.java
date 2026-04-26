package si.itarhitekture.dogodki.app;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import si.itarhitekture.dogodki.domain.EventDocument;
import si.itarhitekture.dogodki.domain.EventType;
import si.itarhitekture.dogodki.infra.EventRepository;

@Service
public class EventService {
  private final EventRepository repo;

  public EventService(EventRepository repo) {
    this.repo = repo;
  }

  public Mono<EventDocument> save(EventDocument e) {
    return repo.save(e);
  }

  public Mono<EventDocument> get(String id) {
    return repo.findById(id);
  }

  public Flux<EventDocument> list(EventType type) {
    return type == null ? repo.findAll() : repo.findByType(type);
  }
}