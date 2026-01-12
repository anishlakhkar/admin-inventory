package org.cencora.ordermanagement.controller;

import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.cencora.ordermanagement.dto.*;
import org.cencora.ordermanagement.model.OrderStatus;
import org.cencora.ordermanagement.model.OrderType;
import org.cencora.ordermanagement.service.OrderService;

import java.util.List;

@Path("/api/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@PermitAll
public class OrderController {
    
    @Inject
    OrderService orderService;
    
    @POST
    public Response createOrder(@Valid CreateOrderRequest request) {
        try {
            OrderResponse response = orderService.createOrder(request);
            return Response.status(Response.Status.CREATED).entity(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/{id}")
    public Response getOrderById(@PathParam("id") Long id) {
        try {
            OrderResponse response = orderService.getOrderById(id);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @GET
    public Response getOrders(
            @QueryParam("orderType") String orderTypeStr,
            @QueryParam("status") String statusStr,
            @QueryParam("userId") Long userId) {
        try {
            List<OrderResponse> orders;
            
            if (orderTypeStr != null) {
                OrderType orderType = OrderType.valueOf(orderTypeStr.toUpperCase());
                orders = orderService.getOrdersByType(orderType);
            } else if (statusStr != null) {
                OrderStatus status = OrderStatus.valueOf(statusStr.toUpperCase());
                orders = orderService.getOrdersByStatus(status);
            } else if (userId != null) {
                orders = orderService.getOrdersByUserId(userId);
            } else {
                orders = orderService.getAllOrders();
            }
            
            return Response.ok(orders).build();
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
    @Path("/{id}")
    public Response updateOrder(@PathParam("id") Long id, @Valid UpdateOrderRequest request) {
        try {
            OrderResponse response = orderService.updateOrder(id, request);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}/approve-b2b")
    public Response approveB2BOrder(@PathParam("id") Long id, @Valid ApproveB2BOrderRequest request) {
        try {
            OrderResponse response = orderService.approveB2BOrder(id, request);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @DELETE
    @Path("/{id}")
    public Response deleteOrder(@PathParam("id") Long id) {
        try {
            orderService.deleteOrder(id);
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
