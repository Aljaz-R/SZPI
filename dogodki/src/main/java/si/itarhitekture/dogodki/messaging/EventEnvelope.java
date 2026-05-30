package si.itarhitekture.dogodki.messaging;

import java.util.Map;
import si.itarhitekture.dogodki.domain.EventType;

public class EventEnvelope {

  private String eventId;
  private EventType type;
  private String source;
  private Map<String, Object> payload;

  public EventEnvelope() {}

  public EventEnvelope(String eventId, EventType type, String source, Map<String, Object> payload) {
    this.eventId = eventId;
    this.type = type;
    this.source = source;
    this.payload = payload;
  }

  public String getEventId() { return eventId; }
  public void setEventId(String eventId) { this.eventId = eventId; }

  public EventType getType() { return type; }
  public void setType(EventType type) { this.type = type; }

  public String getSource() { return source; }
  public void setSource(String source) { this.source = source; }

  public Map<String, Object> getPayload() { return payload; }
  public void setPayload(Map<String, Object> payload) { this.payload = payload; }
}