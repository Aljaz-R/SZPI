package si.itarhitekture.dogodki.infra;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import si.itarhitekture.dogodki.domain.EventDocument;
import si.itarhitekture.dogodki.domain.EventType;

public interface EventRepository extends ReactiveMongoRepository<EventDocument, String> {
  Flux<EventDocument> findByType(EventType type);
}