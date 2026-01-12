package org.cencora.ticketmanagement.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.cencora.adminapproval.entity.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_comments")
public class TicketComment extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    public Long commentId;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ticket_id", nullable = false)
    public Ticket ticket;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "commented_by", nullable = false)
    public User commentedBy;
    
    @Column(name = "comment", columnDefinition = "TEXT", nullable = false)
    public String comment;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
