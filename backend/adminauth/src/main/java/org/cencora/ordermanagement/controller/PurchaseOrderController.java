package org.cencora.ordermanagement.controller;

import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.cencora.ordermanagement.dto.*;
import org.cencora.ordermanagement.model.PurchaseOrderStatus;
import org.cencora.ordermanagement.service.PurchaseOrderService;

import java.util.List;

@Path("/api/purchase-orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@PermitAll
public class PurchaseOrderController {
    
    @Inject
    PurchaseOrderService purchaseOrderService;
    
    @POST
    public Response createPurchaseOrder(@Valid CreatePurchaseOrderRequest request) {
        try {
            PurchaseOrderResponse response = purchaseOrderService.createPurchaseOrder(request);
            return Response.status(Response.Status.CREATED).entity(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/{id}")
    public Response getPurchaseOrderById(@PathParam("id") Long id) {
        try {
            PurchaseOrderResponse response = purchaseOrderService.getPurchaseOrderById(id);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/order/{orderId}")
    public Response getPurchaseOrderByOrderId(@PathParam("orderId") Long orderId) {
        try {
            PurchaseOrderResponse response = purchaseOrderService.getPurchaseOrderByOrderId(orderId);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @GET
    public Response getPurchaseOrders(@QueryParam("status") String statusStr) {
        try {
            List<PurchaseOrderResponse> orders;
            
            if (statusStr != null) {
                PurchaseOrderStatus status = PurchaseOrderStatus.valueOf(statusStr.toUpperCase());
                orders = purchaseOrderService.getPurchaseOrdersByStatus(status);
            } else {
                orders = purchaseOrderService.getAllPurchaseOrders();
            }
            
            return Response.ok(orders).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Invalid status parameter: " + e.getMessage()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}/status")
    public Response updatePurchaseOrderStatus(@PathParam("id") Long id, @Valid UpdatePurchaseOrderStatusRequest request) {
        try {
            PurchaseOrderResponse response = purchaseOrderService.updatePurchaseOrderStatus(id, request);
            return Response.ok(response).build();
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
