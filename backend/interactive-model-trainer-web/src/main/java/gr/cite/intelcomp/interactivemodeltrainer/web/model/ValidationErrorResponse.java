package gr.cite.intelcomp.interactivemodeltrainer.web.model;

import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;

public class ValidationErrorResponse extends ErrorResponse<String, List<String>> {
    public ValidationErrorResponse(Map<String, List<String>> errors) {
        super("There are validation errors", HttpStatus.BAD_REQUEST.value(), errors);
    }
}
