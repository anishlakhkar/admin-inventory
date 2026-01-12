package org.cencora.inventorymanagement.controller;

import org.cencora.inventorymanagement.dto.ExportRequest;
import org.cencora.inventorymanagement.dto.ExpiryDataExportResponse;
import org.cencora.inventorymanagement.dto.FullInventoryExportResponse;
import org.cencora.inventorymanagement.dto.InventoryValuationReportResponse;
import org.cencora.inventorymanagement.dto.LowStockReportResponse;
import org.cencora.inventorymanagement.dto.PurchaseOrderExportResponse;
import org.cencora.inventorymanagement.dto.RecentReportResponse;
import org.cencora.inventorymanagement.dto.ReportRequest;
import org.cencora.inventorymanagement.service.ReportFileGenerator;
import org.cencora.inventorymanagement.service.ReportService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@Path("/api/reports")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ReportController {
    
    @Inject
    ReportService reportService;
    
    @Inject
    ReportFileGenerator fileGenerator;
    
    /**
     * Generate report based on type
     * POST /api/reports/generate
     */
    @POST
    @Path("/generate")
    public Response generateReport(@Valid ReportRequest request) {
        try {
            // Validate report type
            if (!request.getReportType().equals("inventory-valuation") && 
                !request.getReportType().equals("low-stock")) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Invalid report type. Must be 'inventory-valuation' or 'low-stock'"))
                    .build();
            }
            
            // Validate date range
            if (request.getStartDate().isAfter(request.getEndDate())) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Start date must be before or equal to end date"))
                    .build();
            }
            
            // Validate format
            if (!request.getFormat().equalsIgnoreCase("pdf") && 
                !request.getFormat().equalsIgnoreCase("xlsx") && 
                !request.getFormat().equalsIgnoreCase("csv")) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Invalid format. Must be 'pdf', 'xlsx', or 'csv'"))
                    .build();
            }
            
            // Generate report data
            Object reportResponse;
            String fileName;
            byte[] fileContent = null;
            String contentType = MediaType.APPLICATION_JSON;
            
            if (request.getReportType().equals("inventory-valuation")) {
                InventoryValuationReportResponse response = reportService.generateInventoryValuationReport(
                    request.getStartDate(), request.getEndDate(), request.getFormat());
                reportResponse = response;
                fileName = "Inventory_Valuation_Report_" + request.getStartDate() + "_to_" + request.getEndDate();
                
                // Generate file if format is not JSON
                if (request.getFormat().equalsIgnoreCase("pdf")) {
                    try {
                        fileContent = fileGenerator.generateInventoryValuationPDF(response);
                        contentType = "application/pdf";
                        fileName += ".pdf";
                    } catch (IOException e) {
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Error generating PDF: " + e.getMessage()))
                            .build();
                    }
                } else if (request.getFormat().equalsIgnoreCase("xlsx")) {
                    try {
                        fileContent = fileGenerator.generateInventoryValuationXLSX(response);
                        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileName += ".xlsx";
                    } catch (IOException e) {
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Error generating XLSX: " + e.getMessage()))
                            .build();
                    }
                } else if (request.getFormat().equalsIgnoreCase("csv")) {
                    try {
                        fileContent = fileGenerator.generateInventoryValuationCSV(response);
                        contentType = "text/csv";
                        fileName += ".csv";
                    } catch (IOException e) {
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Error generating CSV: " + e.getMessage()))
                            .build();
                    }
                }
            } else {
                LowStockReportResponse response = reportService.generateLowStockReport(
                    request.getStartDate(), request.getEndDate(), request.getFormat());
                reportResponse = response;
                fileName = "Low_Stock_Report_" + request.getStartDate() + "_to_" + request.getEndDate();
                
                // Generate file if format is not JSON
                if (request.getFormat().equalsIgnoreCase("pdf")) {
                    try {
                        fileContent = fileGenerator.generateLowStockPDF(response);
                        contentType = "application/pdf";
                        fileName += ".pdf";
                    } catch (IOException e) {
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Error generating PDF: " + e.getMessage()))
                            .build();
                    }
                } else if (request.getFormat().equalsIgnoreCase("xlsx")) {
                    try {
                        fileContent = fileGenerator.generateLowStockXLSX(response);
                        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileName += ".xlsx";
                    } catch (IOException e) {
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Error generating XLSX: " + e.getMessage()))
                            .build();
                    }
                } else if (request.getFormat().equalsIgnoreCase("csv")) {
                    try {
                        fileContent = fileGenerator.generateLowStockCSV(response);
                        contentType = "text/csv";
                        fileName += ".csv";
                    } catch (IOException e) {
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Error generating CSV: " + e.getMessage()))
                            .build();
                    }
                }
            }
            
            // Return file if generated, otherwise return JSON
            if (fileContent != null) {
                return Response.ok(fileContent)
                    .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                    .type(contentType)
                    .build();
            } else {
                return Response.ok(reportResponse).build();
            }
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("Error generating report: " + e.getMessage()))
                .build();
        }
    }
    
    /**
     * Get recent reports
     * GET /api/reports/recent
     */
    @GET
    @Path("/recent")
    public Response getRecentReports() {
        try {
            List<RecentReportResponse> recentReports = reportService.getRecentReports();
            return Response.ok(recentReports).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("Error fetching recent reports: " + e.getMessage()))
                .build();
        }
    }
    
    /**
     * Download report by ID
     * GET /api/reports/download/{reportId}
     * Note: Currently returns JSON data. File generation (PDF/XLSX/CSV) can be added later
     */
    @GET
    @Path("/download/{reportId}")
    public Response downloadReport(@PathParam("reportId") Long reportId) {
        try {
            // For now, reports are generated on-demand and not stored
            // This endpoint can be enhanced to:
            // 1. Store generated reports in database/file system
            // 2. Generate actual PDF/XLSX/CSV files
            // 3. Return file download
            
            return Response.status(Response.Status.NOT_IMPLEMENTED)
                .entity(new ErrorResponse("Report download not yet implemented. Reports are generated on-demand."))
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("Error downloading report: " + e.getMessage()))
                .build();
        }
    }
    
    /**
     * Export data in various formats
     * POST /api/reports/export
     */
    @POST
    @Path("/export")
    public Response exportData(@Valid ExportRequest request) {
        try {
            // Validate export type
            if (!request.getExportType().equals("full-inventory") && 
                !request.getExportType().equals("low-stock") &&
                !request.getExportType().equals("expiry-data") &&
                !request.getExportType().equals("purchase-orders")) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Invalid export type. Must be 'full-inventory', 'low-stock', 'expiry-data', or 'purchase-orders'"))
                    .build();
            }
            
            // Validate date range if provided (optional - if not provided, all data is exported)
            if (request.getStartDate() != null && request.getEndDate() != null) {
                if (request.getStartDate().isAfter(request.getEndDate())) {
                    return Response.status(Response.Status.BAD_REQUEST)
                        .entity(new ErrorResponse("Start date must be before or equal to end date"))
                        .build();
                }
            }
            
            // Set default wide date range if not provided to export all data
            LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.of(2010, 1, 1);
            LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : LocalDate.of(2050, 12, 31);
            
            // Validate format
            if (!request.getFormat().equalsIgnoreCase("pdf") && 
                !request.getFormat().equalsIgnoreCase("xlsx") && 
                !request.getFormat().equalsIgnoreCase("csv")) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Invalid format. Must be 'pdf', 'xlsx', or 'csv'"))
                    .build();
            }
            
            // Generate export data
            Object exportResponse;
            String fileName;
            byte[] fileContent = null;
            String contentType = MediaType.APPLICATION_JSON;
            
            if (request.getExportType().equals("full-inventory")) {
                FullInventoryExportResponse response = reportService.generateFullInventoryExport(
                    startDate, endDate, request.getFormat(), request.getWarehouseId());
                exportResponse = response;
                fileName = "Full_Inventory_Export_All_Data";
                
                // Generate file
                if (request.getFormat().equalsIgnoreCase("pdf")) {
                    try {
                        fileContent = fileGenerator.generateFullInventoryPDF(response);
                        contentType = "application/pdf";
                        fileName += ".pdf";
                    } catch (IOException e) {
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Error generating PDF: " + e.getMessage()))
                            .build();
                    }
                } else if (request.getFormat().equalsIgnoreCase("xlsx")) {
                    try {
                        fileContent = fileGenerator.generateFullInventoryXLSX(response);
                        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileName += ".xlsx";
                    } catch (IOException e) {
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Error generating XLSX: " + e.getMessage()))
                            .build();
                    }
                } else if (request.getFormat().equalsIgnoreCase("csv")) {
                    try {
                        fileContent = fileGenerator.generateFullInventoryCSV(response);
                        contentType = "text/csv";
                        fileName += ".csv";
                    } catch (IOException e) {
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Error generating CSV: " + e.getMessage()))
                            .build();
                    }
                }
            } else if (request.getExportType().equals("low-stock")) {
                // Reuse Low Stock Report (exports all low stock items)
                LowStockReportResponse response = reportService.generateLowStockReport(
                    startDate, endDate, request.getFormat());
                exportResponse = response;
                fileName = "Low_Stock_Export_All_Data";
                
                // Generate file
                if (request.getFormat().equalsIgnoreCase("pdf")) {
                    try {
                        fileContent = fileGenerator.generateLowStockPDF(response);
                        contentType = "application/pdf";
                        fileName += ".pdf";
                    } catch (IOException e) {
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Error generating PDF: " + e.getMessage()))
                            .build();
                    }
                } else if (request.getFormat().equalsIgnoreCase("xlsx")) {
                    try {
                        fileContent = fileGenerator.generateLowStockXLSX(response);
                        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileName += ".xlsx";
                    } catch (IOException e) {
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Error generating XLSX: " + e.getMessage()))
                            .build();
                    }
                } else if (request.getFormat().equalsIgnoreCase("csv")) {
                    try {
                        fileContent = fileGenerator.generateLowStockCSV(response);
                        contentType = "text/csv";
                        fileName += ".csv";
                    } catch (IOException e) {
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Error generating CSV: " + e.getMessage()))
                            .build();
                    }
                }
            } else if (request.getExportType().equals("expiry-data")) {
                ExpiryDataExportResponse response = reportService.generateExpiryDataExport(
                    startDate, endDate, request.getFormat(), request.getWarehouseId());
                exportResponse = response;
                fileName = "Expiry_Data_Export_All_Data";
                
                // Generate file
                if (request.getFormat().equalsIgnoreCase("pdf")) {
                    try {
                        fileContent = fileGenerator.generateExpiryDataPDF(response);
                        contentType = "application/pdf";
                        fileName += ".pdf";
                    } catch (IOException e) {
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Error generating PDF: " + e.getMessage()))
                            .build();
                    }
                } else if (request.getFormat().equalsIgnoreCase("xlsx")) {
                    try {
                        fileContent = fileGenerator.generateExpiryDataXLSX(response);
                        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileName += ".xlsx";
                    } catch (IOException e) {
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Error generating XLSX: " + e.getMessage()))
                            .build();
                    }
                } else if (request.getFormat().equalsIgnoreCase("csv")) {
                    try {
                        fileContent = fileGenerator.generateExpiryDataCSV(response);
                        contentType = "text/csv";
                        fileName += ".csv";
                    } catch (IOException e) {
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Error generating CSV: " + e.getMessage()))
                            .build();
                    }
                }
            } else if (request.getExportType().equals("purchase-orders")) {
                PurchaseOrderExportResponse response = reportService.generatePurchaseOrderExport(
                    startDate, endDate, request.getFormat());
                exportResponse = response;
                fileName = "Purchase_Orders_Export_All_Data";
                
                // Generate file
                if (request.getFormat().equalsIgnoreCase("pdf")) {
                    try {
                        fileContent = fileGenerator.generatePurchaseOrderPDF(response);
                        contentType = "application/pdf";
                        fileName += ".pdf";
                    } catch (IOException e) {
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Error generating PDF: " + e.getMessage()))
                            .build();
                    }
                } else if (request.getFormat().equalsIgnoreCase("xlsx")) {
                    try {
                        fileContent = fileGenerator.generatePurchaseOrderXLSX(response);
                        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileName += ".xlsx";
                    } catch (IOException e) {
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Error generating XLSX: " + e.getMessage()))
                            .build();
                    }
                } else if (request.getFormat().equalsIgnoreCase("csv")) {
                    try {
                        fileContent = fileGenerator.generatePurchaseOrderCSV(response);
                        contentType = "text/csv";
                        fileName += ".csv";
                    } catch (IOException e) {
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Error generating CSV: " + e.getMessage()))
                            .build();
                    }
                }
            } else {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Unsupported export type"))
                    .build();
            }
            
            // Return file if generated
            if (fileContent != null) {
                return Response.ok(fileContent)
                    .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                    .type(contentType)
                    .build();
            } else {
                return Response.ok(exportResponse).build();
            }
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("Error exporting data: " + e.getMessage()))
                .build();
        }
    }
    
    // Error response class
    private static class ErrorResponse {
        private String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
}
