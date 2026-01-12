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
import org.cencora.ordermanagement.entity.Prescription;
import org.cencora.ordermanagement.model.PrescriptionStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class PrescriptionService {
    
    @Inject
    UserService userService;
    
    @Transactional
    public PrescriptionResponse createPrescription(CreatePrescriptionRequest request) {
        User user = User.findById(request.userId);
        if (user == null) {
            throw new NotFoundException("User not found");
        }
        
        Prescription prescription = new Prescription();
        prescription.user = user;
        prescription.doctorName = request.doctorName;
        prescription.prescriptionDate = request.prescriptionDate;
        prescription.validUntil = request.validUntil;
        prescription.fileUrl = request.fileUrl;
        prescription.status = request.status != null ? request.status : PrescriptionStatus.UPLOADED;
        
        prescription.persist();
        
        return mapToPrescriptionResponse(prescription);
    }
    
    public PrescriptionResponse getPrescriptionById(Long id) {
        Prescription prescription = Prescription.findById(id);
        if (prescription == null) {
            throw new NotFoundException("Prescription not found with id: " + id);
        }
        return mapToPrescriptionResponse(prescription);
    }
    
    public List<PrescriptionResponse> getAllPrescriptions() {
        return Prescription.listAll().stream()
                .map(p -> mapToPrescriptionResponse((Prescription) p))
                .collect(Collectors.toList());
    }
    
    public List<PrescriptionResponse> getPrescriptionsByStatus(PrescriptionStatus status) {
        return Prescription.find("status", status).list().stream()
                .map(p -> mapToPrescriptionResponse((Prescription) p))
                .collect(Collectors.toList());
    }
    
    public List<PrescriptionResponse> getPrescriptionsByUserId(Long userId) {
        return Prescription.find("user.id", userId).list().stream()
                .map(p -> mapToPrescriptionResponse((Prescription) p))
                .collect(Collectors.toList());
    }
    
    @Transactional
    public PrescriptionResponse updatePrescription(Long id, UpdatePrescriptionRequest request) {
        Prescription prescription = Prescription.findById(id);
        if (prescription == null) {
            throw new NotFoundException("Prescription not found with id: " + id);
        }
        
        if (request.doctorName != null) {
            prescription.doctorName = request.doctorName;
        }
        if (request.prescriptionDate != null) {
            prescription.prescriptionDate = request.prescriptionDate;
        }
        if (request.validUntil != null) {
            prescription.validUntil = request.validUntil;
        }
        if (request.fileUrl != null) {
            prescription.fileUrl = request.fileUrl;
        }
        if (request.status != null) {
            prescription.status = request.status;
        }
        
        prescription.persist();
        
        return mapToPrescriptionResponse(prescription);
    }
    
    @Transactional
    public PrescriptionResponse approvePrescription(Long id, ApprovePrescriptionRequest request) {
        Prescription prescription = Prescription.findById(id);
        if (prescription == null) {
            throw new NotFoundException("Prescription not found");
        }
        
        User admin = User.findById(request.adminUserId);
        if (admin == null) {
            throw new NotFoundException("Admin user not found");
        }
        if (!admin.userTypes.contains(UserType.ADMIN)) {
            throw new ForbiddenException("Only ADMIN can approve prescriptions");
        }
        
        // Validate status transition
        if (request.status == PrescriptionStatus.APPROVED || request.status == PrescriptionStatus.REJECTED) {
            if (prescription.status != PrescriptionStatus.UPLOADED && prescription.status != PrescriptionStatus.UNDER_REVIEW) {
                throw new BadRequestException("Can only approve/reject prescriptions with status UPLOADED or UNDER_REVIEW");
            }
        }
        
        prescription.status = request.status;
        prescription.reviewNotes = request.reviewNotes;
        prescription.reviewedBy = admin;
        prescription.persist();
        
        return mapToPrescriptionResponse(prescription);
    }
    
    @Transactional
    public void deletePrescription(Long id) {
        Prescription prescription = Prescription.findById(id);
        if (prescription == null) {
            throw new NotFoundException("Prescription not found with id: " + id);
        }
        prescription.delete();
    }
    
    private PrescriptionResponse mapToPrescriptionResponse(Prescription prescription) {
        PrescriptionResponse response = new PrescriptionResponse();
        response.id = prescription.id;
        response.user = userService.getUserById(prescription.user.id);
        response.doctorName = prescription.doctorName;
        response.prescriptionDate = prescription.prescriptionDate;
        response.validUntil = prescription.validUntil;
        response.fileUrl = prescription.fileUrl;
        response.status = prescription.status;
        response.reviewNotes = prescription.reviewNotes;
        response.reviewedBy = prescription.reviewedBy != null ? userService.getUserById(prescription.reviewedBy.id) : null;
        response.createdAt = prescription.createdAt;
        response.updatedAt = prescription.updatedAt;
        return response;
    }
}
