package org.cencora.ordermanagement.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@ApplicationScoped
public class FileStorageService {
    
    @ConfigProperty(name = "file.upload.directory", defaultValue = "uploads/prescriptions")
    String uploadDirectory;
    
    public String storeFile(byte[] fileContent, String originalFileName) {
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDirectory);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            
            // Save file
            Path filePath = uploadPath.resolve(uniqueFileName);
            Files.write(filePath, fileContent);
            
            // Return relative path that can be used in URL
            return uniqueFileName;
        } catch (IOException e) {
            throw new BadRequestException("Failed to store file: " + e.getMessage());
        }
    }
    
    public byte[] getFile(String fileName) {
        try {
            Path filePath = Paths.get(uploadDirectory, fileName);
            if (!Files.exists(filePath)) {
                throw new NotFoundException("File not found: " + fileName);
            }
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new NotFoundException("Failed to read file: " + e.getMessage());
        }
    }
    
    public void deleteFile(String fileName) {
        try {
            Path filePath = Paths.get(uploadDirectory, fileName);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (IOException e) {
            // Log error but don't throw - file might already be deleted
        }
    }
    
    public String getContentType(String fileName) {
        if (fileName == null) {
            return "application/octet-stream";
        }
        
        String extension = "";
        if (fileName.contains(".")) {
            extension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
        }
        
        switch (extension) {
            case ".pdf":
                return "application/pdf";
            case ".jpg":
            case ".jpeg":
                return "image/jpeg";
            case ".png":
                return "image/png";
            case ".gif":
                return "image/gif";
            case ".doc":
                return "application/msword";
            case ".docx":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            default:
                return "application/octet-stream";
        }
    }
}
