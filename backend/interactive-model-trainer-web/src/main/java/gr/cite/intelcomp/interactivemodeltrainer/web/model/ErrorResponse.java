package gr.cite.intelcomp.interactivemodeltrainer.web.model;

import java.util.Map;

public abstract class ErrorResponse<ID, O> {
    final String message;
    final Integer code;
    final Map<ID, O> errors;

    protected ErrorResponse(String message, Integer code, Map<ID, O> errors) {
        this.message = message;
        this.code = code;
        this.errors = errors;
    }

    public String getMessage() {
        return message;
    }

    public Integer getCode() {
        return code;
    }

    public Map<ID, O> getErrors() {
        return errors;
    }
}
