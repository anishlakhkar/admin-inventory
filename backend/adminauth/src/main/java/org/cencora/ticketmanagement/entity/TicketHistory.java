package org.cencora.ticketmanagement.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.cencora.adminapproval.entity.User;
import org.cencora.ticketmanagement.model.TicketStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_history")
public class TicketHistory extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    public Long historyId;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ticket_id", nullable = false)
    public Ticket ticket;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "action_by", nullable = false)
    public User actionBy;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "old_status")
    public TicketStatus oldStatus;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "new_status")
    public TicketStatus newStatus;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "old_assignee")
    public User oldAssignee;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "new_assignee")
    public User newAssignee;
    
    @Column(name = "comment", columnDefinition = "TEXT")
    public String comment;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
