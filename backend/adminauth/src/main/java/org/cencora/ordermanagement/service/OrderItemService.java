package org.cencora.ordermanagement.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import org.cencora.ordermanagement.dto.OrderItemResponse;
import org.cencora.ordermanagement.dto.UpdateOrderItemRequest;
import org.cencora.ordermanagement.entity.Order;
import org.cencora.ordermanagement.entity.OrderItem;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class OrderItemService {
    
    public OrderItemResponse getOrderItemById(Long id) {
        OrderItem orderItem = OrderItem.findById(id);
        if (orderItem == null) {
            throw new NotFoundException("Order item not found with id: " + id);
        }
        return mapToOrderItemResponse(orderItem);
    }
    
    public List<OrderItemResponse> getAllOrderItems() {
        return OrderItem.listAll().stream()
                .map(item -> mapToOrderItemResponse((OrderItem) item))
                .collect(Collectors.toList());
    }
    
    public List<OrderItemResponse> getOrderItemsByOrderId(Long orderId) {
        return OrderItem.find("order.id", orderId).list().stream()
                .map(item -> mapToOrderItemResponse((OrderItem) item))
                .collect(Collectors.toList());
    }
    
    @Transactional
    public OrderItemResponse updateOrderItem(Long id, UpdateOrderItemRequest request) {
        OrderItem orderItem = OrderItem.findById(id);
        if (orderItem == null) {
            throw new NotFoundException("Order item not found with id: " + id);
        }
        
        if (request.productId != null) {
            orderItem.productId = request.productId;
        }
        if (request.quantity != null) {
            orderItem.quantity = request.quantity;
        }
        if (request.unitPrice != null) {
            orderItem.unitPrice = request.unitPrice;
        }
        if (request.prescriptionRequired != null) {
            orderItem.prescriptionRequired = request.prescriptionRequired;
        }
        
        orderItem.persist();
        
        return mapToOrderItemResponse(orderItem);
    }
    
    @Transactional
    public void deleteOrderItem(Long id) {
        OrderItem orderItem = OrderItem.findById(id);
        if (orderItem == null) {
            throw new NotFoundException("Order item not found with id: " + id);
        }
        orderItem.delete();
    }
    
    OrderItemResponse mapToOrderItemResponse(OrderItem orderItem) {
        OrderItemResponse response = new OrderItemResponse();
        response.id = orderItem.id;
        response.orderId = orderItem.order.id;
        response.productId = orderItem.productId;
        response.quantity = orderItem.quantity;
        response.unitPrice = orderItem.unitPrice;
        response.prescriptionRequired = orderItem.prescriptionRequired;
        return response;
    }
}
