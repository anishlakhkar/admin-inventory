package org.cencora.adminapproval.controller;

import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.cencora.adminapproval.dto.*;
import org.cencora.adminapproval.service.AuthService;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthController {
    
    @Inject
    AuthService authService;
    
    @POST
    @Path("/login")
    @PermitAll
    public Response login(@Valid LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @POST
    @Path("/signup")
    @PermitAll
    public Response signup(@Valid SignupRequest request) {
        try {
            UserResponse response = authService.signup(request);
            return Response.status(Response.Status.CREATED).entity(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @POST
    @Path("/setup/admin")
    @PermitAll
    public Response setupAdmin(@Valid AdminSetupRequest request) {
        try {
            UserResponse response = authService.setupAdmin(request);
            return Response.status(Response.Status.CREATED).entity(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    public static class ErrorResponse {
        public String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
    }
}
