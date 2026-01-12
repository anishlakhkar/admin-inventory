package org.cencora.inventorymanagement.controller;

import org.cencora.inventorymanagement.dto.PageResponse;
import org.cencora.inventorymanagement.dto.StockResponse;
import org.cencora.inventorymanagement.dto.StockUpdateRequest;
import org.cencora.inventorymanagement.service.StockService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/stock")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class StockController {
    
    @Inject
    StockService stockService;
    
    @GET
    public Response getAllStock(
            @QueryParam("warehouseId") @DefaultValue("001") String warehouseId,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        
        try {
            PageResponse<StockResponse> response = stockService.getAllStock(warehouseId, page, size);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }
    
    @GET
    @Path("/{skuId}")
    public Response getStockById(
            @PathParam("skuId") String skuId,
            @QueryParam("warehouseId") @DefaultValue("001") String warehouseId) {
        
        try {
            StockResponse response = stockService.getStockById(skuId, warehouseId);
            return Response.ok(response).build();
        } catch (jakarta.ws.rs.NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }
    
    @GET
    @Path("/low-stock")
    public Response getLowStock(
            @QueryParam("warehouseId") @DefaultValue("001") String warehouseId,
            @QueryParam("threshold") Long threshold) {
        
        try {
            List<StockResponse> response = stockService.getLowStock(warehouseId, threshold);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }
    
    @PUT
    @Path("/{skuId}")
    public Response updateStock(
            @PathParam("skuId") String skuId,
            @QueryParam("warehouseId") @DefaultValue("001") String warehouseId,
            @Valid StockUpdateRequest request) {
        
        try {
            // Ensure warehouseId matches
            if (!request.getWarehouseId().equals(warehouseId)) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Warehouse ID mismatch")).build();
            }
            
            StockResponse response = stockService.updateStock(skuId, warehouseId, request);
            return Response.ok(response).build();
        } catch (jakarta.ws.rs.NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }
    
    // Inner class for error responses
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
