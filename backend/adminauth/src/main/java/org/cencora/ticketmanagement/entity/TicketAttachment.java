package org.cencora.ticketmanagement.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.cencora.adminapproval.entity.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_attachments")
public class TicketAttachment extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attachment_id")
    public Long attachmentId;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ticket_id", nullable = false)
    public Ticket ticket;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "uploaded_by", nullable = false)
    public User uploadedBy;
    
    @Column(name = "file_url", nullable = false)
    public String fileUrl;
    
    @Column(name = "file_name")
    public String fileName;
    
    @Column(name = "file_size")
    public Long fileSize;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
