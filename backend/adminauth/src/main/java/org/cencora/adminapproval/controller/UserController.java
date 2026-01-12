package org.cencora.adminapproval.controller;

import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.cencora.adminapproval.dto.ApprovalRequest;
import org.cencora.adminapproval.dto.UpdateUserRequest;
import org.cencora.adminapproval.dto.UserResponse;
import org.cencora.adminapproval.model.AccountStatus;
import org.cencora.adminapproval.model.UserType;
import org.cencora.adminapproval.service.UserService;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserController {
    
    @Inject
    UserService userService;
    
    @GET
    @PermitAll
    public Response getAllUsers() {
        return Response.ok(userService.getAllUsers()).build();
    }
    
    @GET
    @Path("/status/{status}")
    @PermitAll
    public Response getUsersByStatus(@PathParam("status") String statusStr) {
        try {
            AccountStatus status = AccountStatus.valueOf(statusStr.toUpperCase());
            return Response.ok(userService.getUsersByStatus(status)).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Invalid status: " + statusStr))
                    .build();
        }
    }
    
    @GET
    @Path("/type/{type}")
    @PermitAll
    public Response getUsersByType(@PathParam("type") String typeStr) {
        try {
            UserType type = UserType.valueOf(typeStr.toUpperCase());
            return Response.ok(userService.getUsersByType(type)).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Invalid user type: " + typeStr))
                    .build();
        }
    }
    
    @GET
    @Path("/{id}")
    @PermitAll
    public Response getUserById(@PathParam("id") Long id) {
        try {
            UserResponse user = userService.getUserById(id);
            return Response.ok(user).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}")
    public Response updateUser(@PathParam("id") Long id, @Valid UpdateUserRequest request) {
        try {
            UserResponse user = userService.updateUser(id, request);
            return Response.ok(user).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}/approval")
    @PermitAll
    public Response approveUser(@PathParam("id") Long id, @Valid ApprovalRequest request) {
        try {
            UserResponse user = userService.approveUser(id, request);
            return Response.ok(user).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @DELETE
    @Path("/{id}")
    public Response deleteUser(@PathParam("id") Long id) {
        try {
            userService.deleteUser(id);
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
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
