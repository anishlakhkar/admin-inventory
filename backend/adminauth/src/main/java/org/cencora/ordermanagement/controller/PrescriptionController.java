package org.cencora.ordermanagement.controller;

import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.cencora.ordermanagement.dto.*;
import org.cencora.ordermanagement.model.PrescriptionStatus;
import org.cencora.ordermanagement.service.FileStorageService;
import org.cencora.ordermanagement.service.PrescriptionService;

import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.util.List;
import jakarta.ws.rs.core.StreamingOutput;

@Path("/api/prescriptions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@PermitAll
public class PrescriptionController {
    
    @Inject
    PrescriptionService prescriptionService;
    
    @Inject
    FileStorageService fileStorageService;
    
    @POST
    public Response createPrescription(@Valid CreatePrescriptionRequest request) {
        try {
            PrescriptionResponse response = prescriptionService.createPrescription(request);
            return Response.status(Response.Status.CREATED).entity(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/{id}")
    public Response getPrescriptionById(@PathParam("id") Long id) {
        try {
            PrescriptionResponse response = prescriptionService.getPrescriptionById(id);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @GET
    public Response getPrescriptions(
            @QueryParam("status") String statusStr,
            @QueryParam("userId") Long userId) {
        try {
            List<PrescriptionResponse> prescriptions;
            
            if (statusStr != null) {
                PrescriptionStatus status = PrescriptionStatus.valueOf(statusStr.toUpperCase());
                prescriptions = prescriptionService.getPrescriptionsByStatus(status);
            } else if (userId != null) {
                prescriptions = prescriptionService.getPrescriptionsByUserId(userId);
            } else {
                prescriptions = prescriptionService.getAllPrescriptions();
            }
            
            return Response.ok(prescriptions).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Invalid status parameter: " + e.getMessage()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}")
    public Response updatePrescription(@PathParam("id") Long id, @Valid UpdatePrescriptionRequest request) {
        try {
            PrescriptionResponse response = prescriptionService.updatePrescription(id, request);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}/approve")
    public Response approvePrescription(@PathParam("id") Long id, @Valid ApprovePrescriptionRequest request) {
        try {
            PrescriptionResponse response = prescriptionService.approvePrescription(id, request);
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @DELETE
    @Path("/{id}")
    public Response deletePrescription(@PathParam("id") Long id) {
        try {
            prescriptionService.deletePrescription(id);
            return Response.status(Response.Status.NO_CONTENT).build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        }
    }
    
    @POST
    @Path("/{id}/upload-file")
    @Consumes(MediaType.APPLICATION_OCTET_STREAM)
    public Response uploadPrescriptionFile(
            @PathParam("id") Long prescriptionId,
            @HeaderParam("X-File-Name") String fileName,
            InputStream fileInputStream) {
        try {
            if (fileName == null || fileName.isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(new ErrorResponse("File name is required in X-File-Name header"))
                        .build();
            }
            
            // Read file content
            byte[] fileContent = fileInputStream.readAllBytes();
            
            // Store file and get stored filename
            String storedFileName = fileStorageService.storeFile(fileContent, fileName);
            
            // Update prescription with file URL
            UpdatePrescriptionRequest updateRequest = new UpdatePrescriptionRequest();
            updateRequest.fileUrl = "/api/prescriptions/" + prescriptionId + "/file/" + storedFileName;
            
            PrescriptionResponse response = prescriptionService.updatePrescription(prescriptionId, updateRequest);
            
            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Failed to upload file: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/{id}/file/{fileName}")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response downloadPrescriptionFile(
            @PathParam("id") Long prescriptionId,
            @PathParam("fileName") String fileName) {
        try {
            // Verify prescription exists
            prescriptionService.getPrescriptionById(prescriptionId);
            
            // Get file content
            byte[] fileContent = fileStorageService.getFile(fileName);
            String contentType = fileStorageService.getContentType(fileName);
            
            // Extract original filename from stored filename (remove UUID, keep extension)
            // If fileName is like "abc123-def456-ghi789.pdf", we keep it as is
            // But we can also use a more readable name if needed
            String displayFileName = fileName;
            
            // Use StreamingOutput to ensure binary data is sent correctly
            StreamingOutput stream = output -> {
                output.write(fileContent);
                output.flush();
            };
            
            return Response.ok(stream)
                    .type(contentType)
                    .header("Content-Disposition", "inline; filename=\"" + displayFileName + "\"")
                    .header("Content-Length", String.valueOf(fileContent.length))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse("File not found: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/{id}/file")
    public Response getPrescriptionFile(@PathParam("id") Long id) {
        try {
            PrescriptionResponse prescription = prescriptionService.getPrescriptionById(id);
            
            if (prescription.fileUrl == null || prescription.fileUrl.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(new ErrorResponse("No file associated with this prescription"))
                        .build();
            }
            
            // Extract filename from URL if it's a stored file
            String fileName = prescription.fileUrl;
            if (fileName.contains("/file/")) {
                fileName = fileName.substring(fileName.lastIndexOf("/file/") + 6);
            } else if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
                // External URL - redirect to it
                return Response.temporaryRedirect(java.net.URI.create(fileName)).build();
            }
            
            // Get file content
            byte[] fileContent = fileStorageService.getFile(fileName);
            String contentType = fileStorageService.getContentType(fileName);
            
            // Use a more readable filename for download (prescription-{id}.{ext})
            String fileExtension = "";
            if (fileName.contains(".")) {
                fileExtension = fileName.substring(fileName.lastIndexOf("."));
            }
            String displayFileName = "prescription-" + id + fileExtension;
            
            // Use StreamingOutput to ensure binary data is sent correctly
            StreamingOutput stream = output -> {
                output.write(fileContent);
                output.flush();
            };
            
            return Response.ok(stream)
                    .type(contentType)
                    .header("Content-Disposition", "inline; filename=\"" + displayFileName + "\"")
                    .header("Content-Length", String.valueOf(fileContent.length))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse("File not found: " + e.getMessage()))
                    .build();
        }
    }
    
    public static class ErrorResponse {
        public String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
    }
}
