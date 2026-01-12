package org.cencora.ordermanagement.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import org.cencora.adminapproval.entity.User;
import org.cencora.adminapproval.model.UserType;
import org.cencora.adminapproval.service.UserService;
import org.cencora.ordermanagement.dto.*;
import org.cencora.ordermanagement.entity.Order;
import org.cencora.ordermanagement.entity.OrderItem;
import org.cencora.ordermanagement.entity.Prescription;
import org.cencora.ordermanagement.entity.PurchaseOrder;
import org.cencora.ordermanagement.model.OrderStatus;
import org.cencora.ordermanagement.model.OrderType;
import org.cencora.ordermanagement.model.PrescriptionStatus;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class OrderService {
    
    @Inject
    UserService userService;
    
    @Inject
    OrderItemService orderItemService;
    
    @Inject
    PrescriptionService prescriptionService;
    
    @Inject
    PurchaseOrderService purchaseOrderService;
    
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        User user = User.findById(request.userId);
        if (user == null) {
            throw new NotFoundException("User not found");
        }
        
        // Check if order number already exists
        Order existingOrder = Order.find("orderNumber", request.orderNumber).firstResult();
        if (existingOrder != null) {
            throw new BadRequestException("Order number already exists: " + request.orderNumber);
        }
        
        Order order = new Order();
        order.user = user;
        order.orderType = request.orderType;
        order.orderNumber = request.orderNumber;
        order.subtotalAmt = request.subtotalAmt;
        order.totalAmt = request.totalAmt;
        
        // Set order status based on order type
        // B2B: PROCESSING (waiting for PO approval)
        // B2C: CONFIRMED (auto-confirmed, no PO needed)
        if (request.orderType == OrderType.B2B) {
            order.status = OrderStatus.PROCESSING;
        } else {
            order.status = OrderStatus.CONFIRMED;
        }
        
        order.prescriptionRequired = request.prescriptionRequired;
        
        if (request.prescriptionId != null) {
            Prescription prescription = Prescription.findById(request.prescriptionId);
            if (prescription == null) {
                throw new NotFoundException("Prescription not found");
            }
            order.prescription = prescription;
        }
        
        order.persist();
        
        // Create order items
        if (request.orderItems != null && !request.orderItems.isEmpty()) {
            for (CreateOrderItemRequest itemRequest : request.orderItems) {
                OrderItem orderItem = new OrderItem();
                orderItem.order = order;
                orderItem.productId = itemRequest.productId;
                orderItem.quantity = itemRequest.quantity;
                orderItem.unitPrice = itemRequest.unitPrice;
                orderItem.prescriptionRequired = itemRequest.prescriptionRequired;
                orderItem.persist();
            }
        }
        
        // For B2B orders, PO will be created separately via PurchaseOrderService
        // For B2C orders, no PO needed (status is already CONFIRMED)
        
        return mapToOrderResponse(order);
    }
    
    public OrderResponse getOrderById(Long id) {
        Order order = Order.findById(id);
        if (order == null) {
            throw new NotFoundException("Order not found with id: " + id);
        }
        return mapToOrderResponse(order);
    }
    
    public List<OrderResponse> getAllOrders() {
        return Order.listAll().stream()
                .map(o -> mapToOrderResponse((Order) o))
                .collect(Collectors.toList());
    }
    
    public List<OrderResponse> getOrdersByType(OrderType orderType) {
        return Order.find("orderType", orderType).list().stream()
                .map(o -> mapToOrderResponse((Order) o))
                .collect(Collectors.toList());
    }
    
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return Order.find("status", status).list().stream()
                .map(o -> mapToOrderResponse((Order) o))
                .collect(Collectors.toList());
    }
    
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return Order.find("user.id", userId).list().stream()
                .map(o -> mapToOrderResponse((Order) o))
                .collect(Collectors.toList());
    }
    
    @Transactional
    public OrderResponse updateOrder(Long id, UpdateOrderRequest request) {
        Order order = Order.findById(id);
        if (order == null) {
            throw new NotFoundException("Order not found with id: " + id);
        }
        
        if (request.orderType != null) {
            order.orderType = request.orderType;
        }
        if (request.orderNumber != null) {
            // Check if new order number already exists
            Order existingOrder = Order.find("orderNumber", request.orderNumber).firstResult();
            if (existingOrder != null && !existingOrder.id.equals(id)) {
                throw new BadRequestException("Order number already exists: " + request.orderNumber);
            }
            order.orderNumber = request.orderNumber;
        }
        if (request.subtotalAmt != null) {
            order.subtotalAmt = request.subtotalAmt;
        }
        if (request.totalAmt != null) {
            order.totalAmt = request.totalAmt;
        }
        if (request.status != null) {
            // Convert string status to OrderStatus enum if needed
            try {
                order.status = OrderStatus.valueOf(request.status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid order status: " + request.status);
            }
        }
        if (request.prescriptionRequired != null) {
            order.prescriptionRequired = request.prescriptionRequired;
        }
        if (request.prescriptionId != null) {
            Prescription prescription = Prescription.findById(request.prescriptionId);
            if (prescription == null) {
                throw new NotFoundException("Prescription not found");
            }
            order.prescription = prescription;
        } else if (request.prescriptionId == null && request.prescriptionRequired != null && !request.prescriptionRequired) {
            order.prescription = null;
        }
        
        order.persist();
        
        return mapToOrderResponse(order);
    }
    
    @Transactional
    public OrderResponse approveB2BOrder(Long id, ApproveB2BOrderRequest request) {
        Order order = Order.findById(id);
        if (order == null) {
            throw new NotFoundException("Order not found");
        }
        
        if (order.orderType != OrderType.B2B) {
            throw new BadRequestException("Only B2B orders can be approved using this endpoint");
        }
        
        User admin = User.findById(request.adminUserId);
        if (admin == null) {
            throw new NotFoundException("Admin user not found");
        }
        if (!admin.userTypes.contains(UserType.ADMIN)) {
            throw new ForbiddenException("Only ADMIN can approve B2B orders");
        }
        
        // This method is deprecated - B2B orders should use PO approval workflow
        // Keeping for backward compatibility, but PO approval should be used instead
        if (order.status != OrderStatus.PROCESSING) {
            throw new BadRequestException("Can only approve orders with status PROCESSING");
        }
        
        order.status = OrderStatus.CONFIRMED;
        order.persist();
        
        return mapToOrderResponse(order);
    }
    
    @Transactional
    public void deleteOrder(Long id) {
        Order order = Order.findById(id);
        if (order == null) {
            throw new NotFoundException("Order not found with id: " + id);
        }
        
        // Delete associated order items first
        List<OrderItem> orderItems = OrderItem.find("order.id", id).list();
        for (OrderItem item : orderItems) {
            item.delete();
        }
        
        order.delete();
    }
    
    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.id = order.id;
        response.user = userService.getUserById(order.user.id);
        response.orderType = order.orderType;
        response.orderNumber = order.orderNumber;
        response.subtotalAmt = order.subtotalAmt;
        response.totalAmt = order.totalAmt;
        response.status = order.status;
        
        // Include PurchaseOrder for B2B orders only
        if (order.orderType == OrderType.B2B) {
            response.purchaseOrder = purchaseOrderService.getPurchaseOrderByOrderId(order.id);
        } else {
            response.purchaseOrder = null;
        }
        
        response.prescriptionRequired = order.prescriptionRequired;
        response.prescription = order.prescription != null ? 
                prescriptionService.getPrescriptionById(order.prescription.id) : null;
        response.orderItems = orderItemService.getOrderItemsByOrderId(order.id);
        response.createdAt = order.createdAt;
        response.updatedAt = order.updatedAt;
        return response;
    }
}
