package org.cencora.ordermanagement.controller;

import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.cencora.ordermanagement.dto.OrderItemResponse;
import org.cencora.ordermanagement.dto.UpdateOrderItemRequest;
import org.cencora.ordermanagement.service.OrderItemService;

import java.util.List;

@Path("/api/order-items")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@PermitAll
public class OrderItemController {
    
    @Inject
    OrderItemService orderItemService;
    
    @GET
    @Path("/{id}")
    public Response getOrderItemById(@PathParam("id") Long id) {
        try {
            OrderItemResponse response = orderItemService.getOrderItemById(id);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @GET
    public Response getOrderItems(@QueryParam("orderId") Long orderId) {
        try {
            List<OrderItemResponse> orderItems;
            
            if (orderId != null) {
                orderItems = orderItemService.getOrderItemsByOrderId(orderId);
            } else {
                orderItems = orderItemService.getAllOrderItems();
            }
            
            return Response.ok(orderItems).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}")
    public Response updateOrderItem(@PathParam("id") Long id, @Valid UpdateOrderItemRequest request) {
        try {
            OrderItemResponse response = orderItemService.updateOrderItem(id, request);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @DELETE
    @Path("/{id}")
    public Response deleteOrderItem(@PathParam("id") Long id) {
        try {
            orderItemService.deleteOrderItem(id);
            return Response.status(Response.Status.NO_CONTENT).build();
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
