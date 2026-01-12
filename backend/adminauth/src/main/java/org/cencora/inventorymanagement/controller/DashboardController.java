package org.cencora.inventorymanagement.controller;

import org.cencora.inventorymanagement.dto.DashboardResponse;
import org.cencora.inventorymanagement.service.DashboardService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/dashboard")
@Produces(MediaType.APPLICATION_JSON)
public class DashboardController {
    
    @Inject
    DashboardService dashboardService;
    
    @GET
    public Response getDashboard(
            @QueryParam("warehouseId") @DefaultValue("all") String warehouseId,
            @QueryParam("category") String category,
            @QueryParam("status") String status) {
        
        try {
            DashboardResponse response = dashboardService.getDashboardData(warehouseId, category, status);
            return Response.ok(response).build();
        } catch (jakarta.ws.rs.NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }
    
    // Error response class
    private static class ErrorResponse {
        private String message;
        
        public ErrorResponse(String message) {
            this.message = message;   }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
}