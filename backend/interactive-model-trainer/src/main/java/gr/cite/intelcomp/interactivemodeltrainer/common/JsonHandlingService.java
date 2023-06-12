package gr.cite.intelcomp.interactivemodeltrainer.common;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_SINGLETON)
public class JsonHandlingService {
	private final ObjectMapper objectMapper = new ObjectMapper();

	public JsonHandlingService() {
		objectMapper.registerModule(new JavaTimeModule());
	}

	public String toJson(Object item) throws JsonProcessingException {
		if (item == null) return null;
		return objectMapper.writeValueAsString(item);
	}

	public String toJsonSafe(Object item) {
		if (item == null) return null;
		try {
			return objectMapper.writeValueAsString(item);
		} catch (Exception ex) {
			return null;
		}
	}

	public <T> T fromJson(Class<T> type, String json) throws JsonProcessingException {
		if (json == null) return null;
		return objectMapper.readValue(json, type);
	}

	public <T> T fromJsonSafe(Class<T> type, String json) {
		if (json == null) return null;
		try {
			return objectMapper.readValue(json, type);
		} catch (Exception ex) {
			return null;
		}
	}
}
