package org.cencora.ticketmanagement.controller;

import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.cencora.ticketmanagement.dto.*;
import org.cencora.ticketmanagement.model.Priority;
import org.cencora.ticketmanagement.model.TicketStatus;
import org.cencora.ticketmanagement.model.TicketType;
import org.cencora.ticketmanagement.service.TicketService;

import java.util.List;

@Path("/api/tickets")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TicketController {
    
    @Inject
    TicketService ticketService;
    
    @POST
    @PermitAll
    public Response createTicket(@Valid CreateTicketRequest request) {
        try {
            TicketResponse response = ticketService.createTicket(request, request.raisedByUserId);
            return Response.status(Response.Status.CREATED).entity(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/{id}")
    @PermitAll
    public Response getTicketById(@PathParam("id") Long id) {
        try {
            TicketResponse response = ticketService.getTicketById(id);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @PermitAll
    public Response getTickets(
            @QueryParam("status") String statusStr,
            @QueryParam("priority") String priorityStr,
            @QueryParam("ticketType") String ticketTypeStr,
            @QueryParam("assignedTo") Long assignedTo) {
        try {
            TicketStatus status = statusStr != null ? TicketStatus.valueOf(statusStr.toUpperCase()) : null;
            Priority priority = priorityStr != null ? Priority.valueOf(priorityStr.toUpperCase()) : null;
            TicketType ticketType = ticketTypeStr != null ? TicketType.valueOf(ticketTypeStr.toUpperCase()) : null;
            
            List<TicketResponse> tickets = ticketService.getTickets(status, priority, ticketType, assignedTo);
            return Response.ok(tickets).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Invalid filter parameter: " + e.getMessage()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}/assign")
    @PermitAll
    public Response assignTicketToExecutive(@PathParam("id") Long id, @Valid AssignTicketRequest request) {
        try {
            TicketResponse response = ticketService.assignTicketToExecutive(id, request, request.adminUserId);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}/resolve")
    @PermitAll
    public Response adminResolveTicket(@PathParam("id") Long id, @Valid UpdateTicketStatusRequest request) {
        try {
            TicketResponse response = ticketService.adminResolveTicket(id, request, request.userId);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}/status")
    @PermitAll
    public Response executiveUpdateTicketStatus(@PathParam("id") Long id, @Valid UpdateTicketStatusRequest request) {
        try {
            TicketResponse response = ticketService.executiveUpdateTicketStatus(id, request, request.userId);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}/resolve-executive")
    @PermitAll
    public Response executiveResolveTicket(@PathParam("id") Long id, @Valid UpdateTicketStatusRequest request) {
        try {
            TicketResponse response = ticketService.executiveResolveTicket(id, request, request.userId);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}/close")
    @PermitAll
    public Response adminCloseTicket(@PathParam("id") Long id, @Valid UpdateTicketStatusRequest request) {
        try {
            TicketResponse response = ticketService.adminCloseTicket(id, request, request.userId);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @POST
    @Path("/{id}/comments")
    @PermitAll
    public Response addComment(@PathParam("id") Long id, @Valid AddCommentRequest request) {
        try {
            TicketCommentResponse response = ticketService.addComment(id, request, request.userId);
            return Response.status(Response.Status.CREATED).entity(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @POST
    @Path("/{id}/attachments")
    @PermitAll
    public Response addAttachment(@PathParam("id") Long id, @Valid AddAttachmentRequest request) {
        try {
            TicketAttachmentResponse response = ticketService.addAttachment(id, request, request.userId);
            return Response.status(Response.Status.CREATED).entity(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/{id}/history")
    @PermitAll
    public Response getTicketHistory(@PathParam("id") Long id) {
        try {
            List<TicketHistoryResponse> history = ticketService.getTicketHistory(id);
            return Response.ok(history).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/{id}/comments")
    @PermitAll
    public Response getTicketComments(@PathParam("id") Long id) {
        try {
            List<TicketCommentResponse> comments = ticketService.getTicketComments(id);
            return Response.ok(comments).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/{id}/attachments")
    @PermitAll
    public Response getTicketAttachments(@PathParam("id") Long id) {
        try {
            List<TicketAttachmentResponse> attachments = ticketService.getTicketAttachments(id);
            return Response.ok(attachments).build();
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
