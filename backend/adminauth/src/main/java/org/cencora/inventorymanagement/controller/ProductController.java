package org.cencora.inventorymanagement.controller;

import org.cencora.inventorymanagement.dto.PageResponse;
import org.cencora.inventorymanagement.dto.ProductRequest;
import org.cencora.inventorymanagement.dto.ProductResponse;
import org.cencora.inventorymanagement.dto.UpdatePersonaTypeRequest;
import org.cencora.inventorymanagement.service.ProductService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProductController {
    
    @Inject
    ProductService productService;
    
    @GET
    public Response getAllProducts(
            @QueryParam("warehouseId") @DefaultValue("all") String warehouseId,
            @QueryParam("search") String search,
            @QueryParam("personaType") String personaType,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size,
            @QueryParam("sortBy") String sortBy,
            @QueryParam("direction") @DefaultValue("ASC") String direction) {
        
        try {
            PageResponse<ProductResponse> response = productService.getAllProducts(
                warehouseId, search, personaType, page, size, sortBy, direction);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }
    
    @GET
    @Path("/{skuId}")
    public Response getProductById(
            @PathParam("skuId") String skuId,
            @QueryParam("warehouseId") @DefaultValue("001") String warehouseId) {
        
        try {
            ProductResponse response = productService.getProductById(skuId, warehouseId);
            return Response.ok(response).build();
        } catch (jakarta.ws.rs.NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }
    
    @POST
    public Response createProduct(@Valid ProductRequest request) {
        try {
            ProductResponse response = productService.createProduct(request);
            return Response.status(Response.Status.CREATED).entity(response).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage())).build();
        } catch (jakarta.ws.rs.NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }
    
    @PUT
    @Path("/{skuId}")
    public Response updateProduct(
            @PathParam("skuId") String skuId,
            @QueryParam("warehouseId") @DefaultValue("001") String warehouseId,
            @Valid ProductRequest request) {
        
        try {
            ProductResponse response = productService.updateProduct(skuId, warehouseId, request);
            return Response.ok(response).build();
        } catch (jakarta.ws.rs.NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }
    
    @PUT
    @Path("/{skuId}/persona-type")
    public Response updatePersonaType(
            @PathParam("skuId") String skuId,
            @QueryParam("warehouseId") @DefaultValue("001") String warehouseId,
            @Valid UpdatePersonaTypeRequest request) {
        
        try {
            ProductResponse response = productService.updatePersonaType(skuId, warehouseId, request.getPersonaType());
            return Response.ok(response).build();
        } catch (jakarta.ws.rs.NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse(e.getMessage())).build();
        }
    }
    
    @DELETE
    @Path("/{skuId}")
    public Response deleteProduct(
            @PathParam("skuId") String skuId,
            @QueryParam("warehouseId") @DefaultValue("001") String warehouseId) {
        
        try {
            productService.deleteProduct(skuId, warehouseId);
            return Response.noContent().build();
        } catch (jakarta.ws.rs.NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage())).build();
        } catch (IllegalStateException e) {
            return Response.status(Response.Status.BAD_REQUEST)
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
