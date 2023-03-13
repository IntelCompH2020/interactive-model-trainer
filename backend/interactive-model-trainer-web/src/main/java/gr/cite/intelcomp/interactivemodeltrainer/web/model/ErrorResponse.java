package gr.cite.intelcomp.interactivemodeltrainer.web.model;

import org.springframework.http.HttpStatus;

import java.util.Map;

public abstract class ErrorResponse<ID, O> {
    final String message;
    final Integer status;
    final String statusText;
    final Map<ID, O> errors;

    protected ErrorResponse(String message, Integer status, Map<ID, O> errors) {
        this.message = message;
        this.status = status;
        this.errors = errors;
        HttpStatus s = HttpStatus.resolve(status);
        this.statusText = s != null ? s.toString() : HttpStatus.INTERNAL_SERVER_ERROR.toString();
    }

    public String getMessage() {
        return message;
    }

    public Integer getStatus() {
        return status;
    }

    public String getStatusText() {
        return statusText;
    }

    public Map<ID, O> getErrors() {
        return errors;
    }
}
