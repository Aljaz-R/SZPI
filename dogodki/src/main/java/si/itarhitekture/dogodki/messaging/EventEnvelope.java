package si.itarhitekture.dogodki.messaging;

import si.itarhitekture.dogodki.domain.EventType;

import java.util.Map;

public record EventEnvelope(
  EventType type,
  String source,
  Map<String, Object> payload
) {}