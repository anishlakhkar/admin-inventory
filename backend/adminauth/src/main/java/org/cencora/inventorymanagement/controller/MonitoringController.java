package org.cencora.inventorymanagement.controller;

import org.cencora.inventorymanagement.dto.ExpiryTrackingResponse;
import org.cencora.inventorymanagement.dto.LowStockAlertResponse;
import org.cencora.inventorymanagement.dto.StockLevelResponse;
import org.cencora.inventorymanagement.service.MonitoringService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/monitoring")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MonitoringController {
    
    @Inject
    MonitoringService monitoringService;
    
    /**
     * Get stock levels for all products
     * GET /api/monitoring/stock-levels?warehouseId=001&category=ANTIBIOTICS&status=Critical
     */
    @GET
    @Path("/stock-levels")
    public Response getStockLevels(
            @QueryParam("warehouseId") @DefaultValue("all") String warehouseId,
            @QueryParam("category") String category,
            @QueryParam("status") String status) {
        try {
            List<StockLevelResponse> stockLevels = monitoringService.getStockLevels(
                warehouseId, category, status);
            return Response.ok(stockLevels).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }
    
    /**
     * Get low stock alerts
     * GET /api/monitoring/low-stock-alerts?warehouseId=001&category=ANTIBIOTICS
     */
    @GET
    @Path("/low-stock-alerts")
    public Response getLowStockAlerts(
            @QueryParam("warehouseId") @DefaultValue("all") String warehouseId,
            @QueryParam("category") String category) {
        try {
            List<LowStockAlertResponse> alerts = monitoringService.getLowStockAlerts(
                warehouseId, category);
            return Response.ok(alerts).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }
    
    /**
     * Get expiry tracking data
     * GET /api/monitoring/expiry-tracking?warehouseId=001&category=ANTIBIOTICS&daysFilter=30
     */
    @GET
    @Path("/expiry-tracking")
    public Response getExpiryTracking(
            @QueryParam("warehouseId") @DefaultValue("all") String warehouseId,
            @QueryParam("category") String category,
            @QueryParam("daysFilter") Integer daysFilter) {
        try {
            List<ExpiryTrackingResponse> expiryData = monitoringService.getExpiryTracking(
                warehouseId, category, daysFilter);
            return Response.ok(expiryData).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }
    
    // Error response class
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
