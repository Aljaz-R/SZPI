package si.itarhitekture.dogodki.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document("events")
public class EventDocument {
  @Id
  private String id;

  private EventType type;
  private String source;
  private Map<String, Object> payload;
  private Instant createdAt;

  public EventDocument() {}

  public EventDocument(EventType type, String source, Map<String, Object> payload, Instant createdAt) {
    this.type = type;
    this.source = source;
    this.payload = payload;
    this.createdAt = createdAt;
  }

  public String getId() { return id; }
  public EventType getType() { return type; }
  public String getSource() { return source; }
  public Map<String, Object> getPayload() { return payload; }
  public Instant getCreatedAt() { return createdAt; }

  public void setId(String id) { this.id = id; }
  public void setType(EventType type) { this.type = type; }
  public void setSource(String source) { this.source = source; }
  public void setPayload(Map<String, Object> payload) { this.payload = payload; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}