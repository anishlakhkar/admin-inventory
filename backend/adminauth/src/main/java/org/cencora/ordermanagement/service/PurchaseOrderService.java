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
import org.cencora.ordermanagement.entity.PurchaseOrder;
import org.cencora.ordermanagement.model.OrderStatus;
import org.cencora.ordermanagement.model.OrderType;
import org.cencora.ordermanagement.model.PurchaseOrderStatus;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class PurchaseOrderService {
    
    @Inject
    UserService userService;
    
    /**
     * Generate PO number in format: PO-YYYY-XXXX
     */
    private String generatePONumber() {
        int year = java.time.LocalDate.now().getYear();
        // Get the next sequence number (simple implementation - in production, use a proper sequence table)
        long count = PurchaseOrder.count();
        String sequence = String.format("%04d", count + 1);
        return "PO-" + year + "-" + sequence;
    }
    
    @Transactional
    public PurchaseOrderResponse createPurchaseOrder(CreatePurchaseOrderRequest request) {
        Order order = Order.findById(request.orderId);
        if (order == null) {
            throw new NotFoundException("Order not found with id: " + request.orderId);
        }
        
        // Only B2B orders can have POs
        if (order.orderType != OrderType.B2B) {
            throw new BadRequestException("Purchase orders can only be created for B2B orders");
        }
        
        // Check if PO already exists for this order
        PurchaseOrder existingPO = PurchaseOrder.find("order.id", request.orderId).firstResult();
        if (existingPO != null) {
            throw new BadRequestException("Purchase order already exists for this order");
        }
        
        // Ensure order status is PROCESSING
        if (order.status != OrderStatus.PROCESSING) {
            order.status = OrderStatus.PROCESSING;
            order.persist();
        }
        
        PurchaseOrder po = new PurchaseOrder();
        po.poNumber = generatePONumber();
        po.order = order;
        po.status = PurchaseOrderStatus.PENDING; // PO starts with PENDING status, will be set to APPROVED/REJECTED
        po.totalAmount = request.totalAmount != null ? request.totalAmount : order.totalAmt;
        po.comments = request.comments;
        po.approvedRejectedBy = null;
        po.approvedRejectedAt = null;
        
        po.persist();
        
        return mapToPurchaseOrderResponse(po);
    }
    
    public PurchaseOrderResponse getPurchaseOrderById(Long poId) {
        PurchaseOrder po = PurchaseOrder.findById(poId);
        if (po == null) {
            throw new NotFoundException("Purchase order not found with id: " + poId);
        }
        return mapToPurchaseOrderResponse(po);
    }
    
    public PurchaseOrderResponse getPurchaseOrderByOrderId(Long orderId) {
        PurchaseOrder po = PurchaseOrder.find("order.id", orderId).firstResult();
        if (po == null) {
            return null; // Return null instead of throwing exception for optional PO
        }
        return mapToPurchaseOrderResponse(po);
    }
    
    public List<PurchaseOrderResponse> getAllPurchaseOrders() {
        return PurchaseOrder.listAll().stream()
                .map(po -> mapToPurchaseOrderResponse((PurchaseOrder) po))
                .collect(Collectors.toList());
    }
    
    public List<PurchaseOrderResponse> getPurchaseOrdersByStatus(PurchaseOrderStatus status) {
        return PurchaseOrder.find("status", status).list().stream()
                .map(po -> mapToPurchaseOrderResponse((PurchaseOrder) po))
                .collect(Collectors.toList());
    }
    
    @Transactional
    public PurchaseOrderResponse updatePurchaseOrderStatus(Long poId, UpdatePurchaseOrderStatusRequest request) {
        PurchaseOrder po = PurchaseOrder.findById(poId);
        if (po == null) {
            throw new NotFoundException("Purchase order not found with id: " + poId);
        }
        
        User admin = User.findById(request.adminUserId);
        if (admin == null) {
            throw new NotFoundException("Admin user not found");
        }
        if (!admin.userTypes.contains(UserType.ADMIN)) {
            throw new ForbiddenException("Only ADMIN can approve/reject purchase orders");
        }
        
        po.status = request.status;
        po.approvedRejectedBy = admin;
        po.approvedRejectedAt = java.time.LocalDateTime.now();
        po.comments = request.comments != null ? request.comments : po.comments;
        
        po.persist();
        
        // Update order status based on PO status
        Order order = po.order;
        if (request.status == PurchaseOrderStatus.APPROVED) {
            order.status = OrderStatus.CONFIRMED;
        } else if (request.status == PurchaseOrderStatus.REJECTED) {
            order.status = OrderStatus.CANCELLED;
        }
        order.persist();
        
        return mapToPurchaseOrderResponse(po);
    }
    
    private PurchaseOrderResponse mapToPurchaseOrderResponse(PurchaseOrder po) {
        PurchaseOrderResponse response = new PurchaseOrderResponse();
        response.poId = po.poId;
        response.poNumber = po.poNumber;
        response.orderId = po.order.id;
        response.status = po.status;
        response.totalAmount = po.totalAmount;
        response.comments = po.comments;
        response.approvedRejectedBy = po.approvedRejectedBy != null ? 
                userService.getUserById(po.approvedRejectedBy.id) : null;
        response.createdAt = po.createdAt;
        response.approvedRejectedAt = po.approvedRejectedAt;
        response.updatedAt = po.updatedAt;
        return response;
    }
}
