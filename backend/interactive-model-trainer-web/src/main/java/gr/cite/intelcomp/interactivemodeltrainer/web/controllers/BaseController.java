package gr.cite.intelcomp.interactivemodeltrainer.web.controllers;

import com.google.common.collect.Lists;
import gr.cite.intelcomp.interactivemodeltrainer.web.model.ValidationErrorResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.validation.beanvalidation.SpringValidatorAdapter;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.*;

@ControllerAdvice
@Order(100)
public class BaseController {

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseBody
    public ValidationErrorResponse handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, List<String>> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            try {
                String fieldName = ((FieldError) error).getField();
                String errorMessage = error.getDefaultMessage();
                if (errors.get(fieldName) != null) errors.get(fieldName).add(errorMessage);
                else errors.put(fieldName, Lists.newArrayList(Collections.singletonList(errorMessage)));
            } catch (ClassCastException e) {
                String fieldName = error.getObjectName();
                String errorMessage = error.getDefaultMessage();
                if (errors.get(fieldName) != null) errors.get(fieldName).add(errorMessage);
                else errors.put(fieldName, Lists.newArrayList(Collections.singletonList(errorMessage)));
            }
        });
        return new ValidationErrorResponse(errors);
    }

}
