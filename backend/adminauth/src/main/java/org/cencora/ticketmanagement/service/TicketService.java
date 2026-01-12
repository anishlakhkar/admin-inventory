package org.cencora.ticketmanagement.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import org.cencora.adminapproval.entity.User;
import org.cencora.adminapproval.model.UserType;
import org.cencora.adminapproval.service.UserService;
import org.cencora.ticketmanagement.dto.*;
import org.cencora.ticketmanagement.entity.Ticket;
import org.cencora.ticketmanagement.entity.TicketAttachment;
import org.cencora.ticketmanagement.entity.TicketComment;
import org.cencora.ticketmanagement.entity.TicketHistory;
import org.cencora.ticketmanagement.model.Priority;
import org.cencora.ticketmanagement.model.TicketStatus;
import org.cencora.ticketmanagement.model.TicketType;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@ApplicationScoped
public class TicketService {
    
    @Inject
    UserService userService;
    
    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request, Long raisedByUserId) {
        User raisedBy = User.findById(raisedByUserId);
        if (raisedBy == null) {
            throw new NotFoundException("User not found");
        }
        
        // Find admin user to assign ticket
        User admin = findAdminUser();
        if (admin == null) {
            throw new BadRequestException("No admin user found. Cannot create ticket.");
        }
        
        Ticket ticket = new Ticket();
        ticket.raisedBy = raisedBy;
        ticket.assignedTo = admin;
        ticket.ticketType = request.ticketType;
        ticket.priority = request.priority;
        ticket.status = TicketStatus.OPEN;
        ticket.title = request.title;
        ticket.description = request.description;
        
        ticket.persist();
        
        // Create history entry
        createHistoryEntry(ticket, raisedBy, null, TicketStatus.OPEN, null, admin, "Ticket created");
        
        return mapToTicketResponse(ticket);
    }
    
    public TicketResponse getTicketById(Long ticketId) {
        Ticket ticket = Ticket.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found with id: " + ticketId);
        }
        return mapToTicketResponse(ticket);
    }
    
    public List<TicketResponse> getTickets(TicketStatus status, Priority priority, TicketType ticketType, Long assignedTo) {
        List<Ticket> tickets = Ticket.listAll();
        
        // Apply filters
        if (status != null) {
            tickets = tickets.stream()
                    .filter(t -> t.status == status)
                    .collect(Collectors.toList());
        }
        if (priority != null) {
            tickets = tickets.stream()
                    .filter(t -> t.priority == priority)
                    .collect(Collectors.toList());
        }
        if (ticketType != null) {
            tickets = tickets.stream()
                    .filter(t -> t.ticketType == ticketType)
                    .collect(Collectors.toList());
        }
        if (assignedTo != null) {
            tickets = tickets.stream()
                    .filter(t -> t.assignedTo != null && t.assignedTo.id.equals(assignedTo))
                    .collect(Collectors.toList());
        }
        
        return tickets.stream()
                .map(this::mapToTicketResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public TicketResponse assignTicketToExecutive(Long ticketId, AssignTicketRequest request, Long adminUserId) {
        Ticket ticket = Ticket.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }
        
        User admin = User.findById(adminUserId);
        if (admin == null) {
            throw new NotFoundException("Admin user not found");
        }
        
        User executive = User.findById(request.executiveId);
        if (executive == null) {
            throw new NotFoundException("Executive user not found");
        }
        
        // Verify executive has EXECUTIVE user type
        if (!executive.userTypes.contains(UserType.EXECUTIVE)) {
            throw new BadRequestException("User is not an executive");
        }
        
        // Validate status transition
        if (ticket.status != TicketStatus.OPEN) {
            throw new BadRequestException("Can only assign tickets with OPEN status");
        }
        
        User oldAssignee = ticket.assignedTo;
        TicketStatus oldStatus = ticket.status;
        
        ticket.assignedTo = executive;
        ticket.status = TicketStatus.IN_PROGRESS;
        ticket.persist();
        
        // Create history entry
        createHistoryEntry(ticket, admin, oldStatus, TicketStatus.IN_PROGRESS, oldAssignee, executive, request.comment);
        
        return mapToTicketResponse(ticket);
    }
    
    @Transactional
    public TicketResponse adminResolveTicket(Long ticketId, UpdateTicketStatusRequest request, Long adminUserId) {
        Ticket ticket = Ticket.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }
        
        User admin = User.findById(adminUserId);
        if (admin == null) {
            throw new NotFoundException("Admin user not found");
        }
        
        if (request.status != TicketStatus.RESOLVED) {
            throw new BadRequestException("Admin can only resolve tickets (status = RESOLVED)");
        }
        
        TicketStatus oldStatus = ticket.status;
        ticket.status = TicketStatus.RESOLVED;
        ticket.persist();
        
        // Create history entry
        createHistoryEntry(ticket, admin, oldStatus, TicketStatus.RESOLVED, ticket.assignedTo, ticket.assignedTo, request.comment);
        
        return mapToTicketResponse(ticket);
    }
    
    @Transactional
    public TicketResponse executiveUpdateTicketStatus(Long ticketId, UpdateTicketStatusRequest request, Long executiveUserId) {
        Ticket ticket = Ticket.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }
        
        User executive = User.findById(executiveUserId);
        if (executive == null) {
            throw new NotFoundException("Executive user not found");
        }
        
        // Verify ticket is assigned to this executive
        if (ticket.assignedTo == null || !ticket.assignedTo.id.equals(executiveUserId)) {
            throw new ForbiddenException("Ticket is not assigned to you");
        }
        
        // Validate status transition
        if (ticket.status == TicketStatus.CLOSED) {
            throw new BadRequestException("Cannot update closed ticket");
        }
        
        if (request.status == TicketStatus.CLOSED) {
            throw new ForbiddenException("Only admin can close tickets");
        }
        
        TicketStatus oldStatus = ticket.status;
        ticket.status = request.status;
        ticket.persist();
        
        // Create history entry
        createHistoryEntry(ticket, executive, oldStatus, request.status, ticket.assignedTo, ticket.assignedTo, request.comment);
        
        return mapToTicketResponse(ticket);
    }
    
    @Transactional
    public TicketResponse executiveResolveTicket(Long ticketId, UpdateTicketStatusRequest request, Long executiveUserId) {
        Ticket ticket = Ticket.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }
        
        User executive = User.findById(executiveUserId);
        if (executive == null) {
            throw new NotFoundException("Executive user not found");
        }
        
        // Verify ticket is assigned to this executive
        if (ticket.assignedTo == null || !ticket.assignedTo.id.equals(executiveUserId)) {
            throw new ForbiddenException("Ticket is not assigned to you");
        }
        
        if (request.status != TicketStatus.RESOLVED) {
            throw new BadRequestException("Can only resolve ticket (status = RESOLVED)");
        }
        
        TicketStatus oldStatus = ticket.status;
        ticket.status = TicketStatus.RESOLVED;
        ticket.persist();
        
        // Create history entry
        createHistoryEntry(ticket, executive, oldStatus, TicketStatus.RESOLVED, ticket.assignedTo, ticket.assignedTo, request.comment);
        
        return mapToTicketResponse(ticket);
    }
    
    @Transactional
    public TicketResponse adminCloseTicket(Long ticketId, UpdateTicketStatusRequest request, Long adminUserId) {
        Ticket ticket = Ticket.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }
        
        User admin = User.findById(adminUserId);
        if (admin == null) {
            throw new NotFoundException("Admin user not found");
        }
        
        if (request.status != TicketStatus.CLOSED) {
            throw new BadRequestException("Can only close ticket (status = CLOSED)");
        }
        
        if (ticket.status != TicketStatus.RESOLVED) {
            throw new BadRequestException("Can only close resolved tickets");
        }
        
        TicketStatus oldStatus = ticket.status;
        ticket.status = TicketStatus.CLOSED;
        ticket.persist();
        
        // Create history entry
        createHistoryEntry(ticket, admin, oldStatus, TicketStatus.CLOSED, ticket.assignedTo, ticket.assignedTo, request.comment);
        
        return mapToTicketResponse(ticket);
    }
    
    @Transactional
    public TicketCommentResponse addComment(Long ticketId, AddCommentRequest request, Long userId) {
        Ticket ticket = Ticket.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }
        
        User user = User.findById(userId);
        if (user == null) {
            throw new NotFoundException("User not found");
        }
        
        TicketComment comment = new TicketComment();
        comment.ticket = ticket;
        comment.commentedBy = user;
        comment.comment = request.comment;
        comment.persist();
        
        return mapToCommentResponse(comment);
    }
    
    @Transactional
    public TicketAttachmentResponse addAttachment(Long ticketId, AddAttachmentRequest request, Long userId) {
        Ticket ticket = Ticket.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }
        
        User user = User.findById(userId);
        if (user == null) {
            throw new NotFoundException("User not found");
        }
        
        TicketAttachment attachment = new TicketAttachment();
        attachment.ticket = ticket;
        attachment.uploadedBy = user;
        attachment.fileUrl = request.fileUrl;
        attachment.fileName = request.fileName;
        attachment.fileSize = request.fileSize;
        attachment.persist();
        
        return mapToAttachmentResponse(attachment);
    }
    
    public List<TicketHistoryResponse> getTicketHistory(Long ticketId) {
        Ticket ticket = Ticket.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }
        
        @SuppressWarnings("unchecked")
        List<TicketHistory> history = TicketHistory.find("ticket.ticketId = ?1 ORDER BY createdAt ASC", ticketId)
                .list();
        
        return history.stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }
    
    public List<TicketCommentResponse> getTicketComments(Long ticketId) {
        Ticket ticket = Ticket.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }
        
        @SuppressWarnings("unchecked")
        List<TicketComment> comments = TicketComment.find("ticket.ticketId = ?1 ORDER BY createdAt ASC", ticketId)
                .list();
        
        return comments.stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }
    
    public List<TicketAttachmentResponse> getTicketAttachments(Long ticketId) {
        Ticket ticket = Ticket.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }
        
        @SuppressWarnings("unchecked")
        List<TicketAttachment> attachments = TicketAttachment.find("ticket.ticketId = ?1 ORDER BY createdAt ASC", ticketId)
                .list();
        
        return attachments.stream()
                .map(this::mapToAttachmentResponse)
                .collect(Collectors.toList());
    }
    
    // Helper methods
    private User findAdminUser() {
        @SuppressWarnings("unchecked")
        List<User> admins = User.getEntityManager()
                .createQuery("SELECT DISTINCT u FROM User u JOIN u.userTypes ut WHERE ut = :userType")
                .setParameter("userType", UserType.ADMIN)
                .getResultList();
        
        return admins.isEmpty() ? null : admins.get(0);
    }
    
    private void createHistoryEntry(Ticket ticket, User actionBy, TicketStatus oldStatus, 
                                   TicketStatus newStatus, User oldAssignee, User newAssignee, String comment) {
        TicketHistory history = new TicketHistory();
        history.ticket = ticket;
        history.actionBy = actionBy;
        history.oldStatus = oldStatus;
        history.newStatus = newStatus;
        history.oldAssignee = oldAssignee;
        history.newAssignee = newAssignee;
        history.comment = comment;
        history.persist();
    }
    
    private TicketResponse mapToTicketResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.ticketId = ticket.ticketId;
        response.raisedBy = userService.getUserById(ticket.raisedBy.id);
        response.assignedTo = ticket.assignedTo != null ? userService.getUserById(ticket.assignedTo.id) : null;
        response.ticketType = ticket.ticketType;
        response.priority = ticket.priority;
        response.status = ticket.status;
        response.title = ticket.title;
        response.description = ticket.description;
        response.createdAt = ticket.createdAt;
        response.updatedAt = ticket.updatedAt;
        return response;
    }
    
    private TicketHistoryResponse mapToHistoryResponse(TicketHistory history) {
        TicketHistoryResponse response = new TicketHistoryResponse();
        response.historyId = history.historyId;
        response.ticketId = history.ticket.ticketId;
        response.actionBy = userService.getUserById(history.actionBy.id);
        response.oldStatus = history.oldStatus;
        response.newStatus = history.newStatus;
        response.oldAssignee = history.oldAssignee != null ? userService.getUserById(history.oldAssignee.id) : null;
        response.newAssignee = history.newAssignee != null ? userService.getUserById(history.newAssignee.id) : null;
        response.comment = history.comment;
        response.createdAt = history.createdAt;
        return response;
    }
    
    private TicketCommentResponse mapToCommentResponse(TicketComment comment) {
        TicketCommentResponse response = new TicketCommentResponse();
        response.commentId = comment.commentId;
        response.ticketId = comment.ticket.ticketId;
        response.commentedBy = userService.getUserById(comment.commentedBy.id);
        response.comment = comment.comment;
        response.createdAt = comment.createdAt;
        return response;
    }
    
    private TicketAttachmentResponse mapToAttachmentResponse(TicketAttachment attachment) {
        TicketAttachmentResponse response = new TicketAttachmentResponse();
        response.attachmentId = attachment.attachmentId;
        response.ticketId = attachment.ticket.ticketId;
        response.uploadedBy = userService.getUserById(attachment.uploadedBy.id);
        response.fileUrl = attachment.fileUrl;
        response.fileName = attachment.fileName;
        response.fileSize = attachment.fileSize;
        response.createdAt = attachment.createdAt;
        return response;
    }
}
