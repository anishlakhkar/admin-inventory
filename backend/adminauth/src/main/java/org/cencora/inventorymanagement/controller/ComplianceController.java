package org.cencora.inventorymanagement.controller;

import org.cencora.inventorymanagement.dto.RegulatoryDocumentRequest;
import org.cencora.inventorymanagement.dto.RegulatoryDocumentResponse;
import org.cencora.inventorymanagement.enums.DocumentStatus;
import org.cencora.inventorymanagement.service.RegulatoryDocumentService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/compliance")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ComplianceController {
    
    @Inject
    RegulatoryDocumentService documentService;
    
    @GET
    @Path("/documents")
    public Response getAllDocuments(
            @QueryParam("status") DocumentStatus status) {
        try {
            List<RegulatoryDocumentResponse> documents;
            if (status != null) {
                documents = documentService.getDocumentsByStatus(status);
            } else {
                documents = documentService.getAllDocuments();
            }
            return Response.ok(documents).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("Error fetching documents: " + e.getMessage()))
                .build();
        }
    }
    
    @GET
    @Path("/documents/{id}")
    public Response getDocumentById(@PathParam("id") Long id) {
        try {
            RegulatoryDocumentResponse document = documentService.getDocumentById(id);
            return Response.ok(document).build();
        } catch (jakarta.ws.rs.NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("Error fetching document: " + e.getMessage()))
                .build();
        }
    }
    
    @POST
    @Path("/documents")
    public Response createDocument(@Valid RegulatoryDocumentRequest request) {
        try {
            RegulatoryDocumentResponse document = documentService.createDocument(request);
            return Response.status(Response.Status.CREATED).entity(document).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("Error creating document: " + e.getMessage()))
                .build();
        }
    }
    
    @POST
    @Path("/documents/{id}/verify")
    public Response verifyDocument(
            @PathParam("id") Long id,
            @QueryParam("verifiedBy") @DefaultValue("Admin") String verifiedBy) {
        try {
            RegulatoryDocumentResponse document = documentService.verifyDocument(id, verifiedBy);
            return Response.ok(document).build();
        } catch (jakarta.ws.rs.NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("Error verifying document: " + e.getMessage()))
                .build();
        }
    }
    
    @POST
    @Path("/documents/{id}/reject")
    public Response rejectDocument(
            @PathParam("id") Long id,
            @QueryParam("rejectedBy") @DefaultValue("Admin") String rejectedBy,
            @Valid RejectDocumentRequest request) {
        try {
            if (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Rejection reason is required"))
                    .build();
            }
            RegulatoryDocumentResponse document = documentService.rejectDocument(
                id, request.getRejectionReason(), rejectedBy);
            return Response.ok(document).build();
        } catch (jakarta.ws.rs.NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("Error rejecting document: " + e.getMessage()))
                .build();
        }
    }
    
    @POST
    @Path("/documents/auto-verify")
    public Response runAutoVerification(
            @QueryParam("threshold") @DefaultValue("90") Integer threshold) {
        try {
            List<RegulatoryDocumentResponse> verified = documentService.runAutoVerification(threshold);
            return Response.ok(verified).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("Error running auto-verification: " + e.getMessage()))
                .build();
        }
    }
    
    @POST
    @Path("/documents/expiry-check")
    public Response runExpiryCheck(
            @QueryParam("alertDays") @DefaultValue("30") Integer alertDays) {
        try {
            List<RegulatoryDocumentResponse> updated = documentService.runExpiryCheck(alertDays);
            return Response.ok(updated).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("Error running expiry check: " + e.getMessage()))
                .build();
        }
    }
    
    @DELETE
    @Path("/documents/{id}")
    public Response deleteDocument(@PathParam("id") Long id) {
        try {
            documentService.deleteDocument(id);
            return Response.noContent().build();
        } catch (jakarta.ws.rs.NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("Error deleting document: " + e.getMessage()))
                .build();
        }
    }
    
    // Inner class for reject request
    public static class RejectDocumentRequest {
        private String rejectionReason;
        
        public String getRejectionReason() {
            return rejectionReason;
        }
        
        public void setRejectionReason(String rejectionReason) {
            this.rejectionReason = rejectionReason;
        }
    }
    
    // Inner class for error response
    private static class ErrorResponse {
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
