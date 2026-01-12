package org.cencora.inventorymanagement.exception;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import java.util.stream.Collectors;

@Provider
public class GlobalExceptionHandler implements ExceptionMapper<Exception> {
    
    @Override
    public Response toResponse(Exception exception) {
        if (exception instanceof ConstraintViolationException) {
            ConstraintViolationException cve = (ConstraintViolationException) exception;
            String message = cve.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining(", "));
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(message))
                .build();
        }
        
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
            .entity(new ErrorResponse(exception.getMessage()))
            .build();
    }
    
    public static class ErrorResponse {
        private String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
}
