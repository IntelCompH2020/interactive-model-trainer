package gr.cite.intelcomp.interactivemodeltrainer.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

import java.util.List;
import java.util.Map;

@ConfigurationProperties(prefix = "training-parameters")
@ConstructorBinding
public class TrainingParametersProperties {

    private final Map<String, ParameterConfiguration> paramsCatalog;
    private final Map<String, List<String>> paramsByTrainer;

    public TrainingParametersProperties(Map<String, ParameterConfiguration> paramsCatalog, Map<String, List<String>> paramsByTrainer) {
        this.paramsCatalog = paramsCatalog;
        this.paramsByTrainer = paramsByTrainer;
    }

    public Map<String, ParameterConfiguration> getParamsCatalog() {
        return paramsCatalog;
    }

    public Map<String, List<String>> getParamsByTrainer() {
        return paramsByTrainer;
    }

    @ConstructorBinding
    public static class ParameterConfiguration {
        final String name;
        final ParameterType type;
        final Object defaultValue;
        final Boolean select;
        final Double min, max;
        final List<Object> options;

        public ParameterConfiguration(String name, ParameterType type, Object defaultValue, Boolean select, Double min, Double max, List<Object> options) {
            this.name = name;
            this.type = type;
            this.defaultValue = defaultValue;
            this.select = select;
            this.min = min;
            this.max = max;
            this.options = options;
        }

        public String getName() {
            return name;
        }

        public ParameterType getType() {
            return type;
        }

        public Object getDefaultValue() {
            return defaultValue;
        }

        public Boolean getSelect() {
            return select;
        }

        public Double getMin() {
            return min;
        }

        public Double getMax() {
            return max;
        }

        public List<Object> getOptions() {
            return options;
        }
    }

    public enum ParameterType {
        STRING, NUMBER, BOOLEAN
    }

}
