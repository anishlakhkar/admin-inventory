package org.cencora.ticketmanagement.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.cencora.adminapproval.entity.User;
import org.cencora.ticketmanagement.model.Priority;
import org.cencora.ticketmanagement.model.TicketStatus;
import org.cencora.ticketmanagement.model.TicketType;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
public class Ticket extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    public Long ticketId;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "raised_by", nullable = false)
    public User raisedBy;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to")
    public User assignedTo;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "ticket_type", nullable = false)
    public TicketType ticketType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    public Priority priority;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    public TicketStatus status;
    
    @Column(name = "title", nullable = false)
    public String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    public String description;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    public LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
