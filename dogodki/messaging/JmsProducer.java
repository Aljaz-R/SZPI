package si.itarhitekture.dogodki.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Component;

@Component
public class JmsProducer {
  private final JmsTemplate jms;
  private final ObjectMapper om;
  private final String queue;

  public JmsProducer(JmsTemplate jms, ObjectMapper om, @Value("${dogodki.queue}") String queue) {
    this.jms = jms;
    this.om = om;
    this.queue = queue;
  }

  public void publish(EventEnvelope env) {
    try {
      String json = om.writeValueAsString(env);
      jms.convertAndSend(queue, json);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}