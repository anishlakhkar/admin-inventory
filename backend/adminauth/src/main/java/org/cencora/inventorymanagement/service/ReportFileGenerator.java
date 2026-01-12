package org.cencora.inventorymanagement.service;

import org.cencora.inventorymanagement.dto.ExpiryDataExportResponse;
import org.cencora.inventorymanagement.dto.FullInventoryExportResponse;
import org.cencora.inventorymanagement.dto.InventoryValuationReportResponse;
import org.cencora.inventorymanagement.dto.LowStockReportResponse;
import org.cencora.inventorymanagement.dto.PurchaseOrderExportResponse;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@ApplicationScoped
public class ReportFileGenerator {
    
    /**
     * Generate PDF file for Inventory Valuation Report
     */
    public byte[] generateInventoryValuationPDF(InventoryValuationReportResponse report) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        
        // Title
        document.add(new Paragraph(report.getReportName()).setBold().setFontSize(18));
        document.add(new Paragraph("Generated: " + report.getGeneratedDate()).setFontSize(10));
        document.add(new Paragraph("Period: " + report.getStartDate() + " to " + report.getEndDate()).setFontSize(10));
        document.add(new Paragraph(" "));
        
        // Summary
        document.add(new Paragraph("Total Valuation: $" + report.getTotalValuation()).setBold().setFontSize(14));
        document.add(new Paragraph(" "));
        
        // Warehouse Summary Table
        if (report.getWarehouseValuations() != null && !report.getWarehouseValuations().isEmpty()) {
            document.add(new Paragraph("Warehouse Summary").setBold().setFontSize(12));
            Table warehouseTable = new Table(UnitValue.createPercentArray(new float[]{2, 2, 2, 2, 2}));
            warehouseTable.addHeaderCell("Warehouse ID");
            warehouseTable.addHeaderCell("Warehouse Name");
            warehouseTable.addHeaderCell("Total Products");
            warehouseTable.addHeaderCell("Total Quantity");
            warehouseTable.addHeaderCell("Total Value");
            
            for (InventoryValuationReportResponse.WarehouseValuation wv : report.getWarehouseValuations()) {
                warehouseTable.addCell(wv.getWarehouseId());
                warehouseTable.addCell(wv.getWarehouseName());
                warehouseTable.addCell(String.valueOf(wv.getTotalProducts()));
                warehouseTable.addCell(String.valueOf(wv.getTotalQuantity()));
                warehouseTable.addCell("$" + wv.getTotalValue());
            }
            document.add(warehouseTable);
            document.add(new Paragraph(" "));
        }
        
        // Product Details Table (first 50 products)
        if (report.getProductValuations() != null && !report.getProductValuations().isEmpty()) {
            document.add(new Paragraph("Product Details (First 50)").setBold().setFontSize(12));
            Table productTable = new Table(UnitValue.createPercentArray(new float[]{2, 3, 2, 2, 2, 2, 2}));
            productTable.addHeaderCell("SKU");
            productTable.addHeaderCell("Product Name");
            productTable.addHeaderCell("Category");
            productTable.addHeaderCell("Warehouse");
            productTable.addHeaderCell("Quantity");
            productTable.addHeaderCell("Unit Price");
            productTable.addHeaderCell("Total Value");
            
            int count = 0;
            for (InventoryValuationReportResponse.ProductValuation pv : report.getProductValuations()) {
                if (count++ >= 50) break;
                productTable.addCell(pv.getSkuId());
                productTable.addCell(pv.getProductName());
                productTable.addCell(pv.getCategory());
                productTable.addCell(pv.getWarehouseId());
                productTable.addCell(String.valueOf(pv.getQuantity()));
                productTable.addCell("$" + pv.getUnitPrice());
                productTable.addCell("$" + pv.getTotalValue());
            }
            document.add(productTable);
        }
        
        document.close();
        return baos.toByteArray();
    }
    
    /**
     * Generate PDF file for Low Stock Report
     */
    public byte[] generateLowStockPDF(LowStockReportResponse report) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        
        // Title
        document.add(new Paragraph(report.getReportName()).setBold().setFontSize(18));
        document.add(new Paragraph("Generated: " + report.getGeneratedDate()).setFontSize(10));
        document.add(new Paragraph("Period: " + report.getStartDate() + " to " + report.getEndDate()).setFontSize(10));
        document.add(new Paragraph(" "));
        
        // Summary
        document.add(new Paragraph("Total Low Stock Items: " + report.getTotalLowStockItems()).setBold().setFontSize(14));
        document.add(new Paragraph(" "));
        
        // Low Stock Items Table
        if (report.getLowStockItems() != null && !report.getLowStockItems().isEmpty()) {
            Table table = new Table(UnitValue.createPercentArray(new float[]{2, 3, 2, 2, 2, 2, 2, 2, 2}));
            table.addHeaderCell("SKU");
            table.addHeaderCell("Product Name");
            table.addHeaderCell("Category");
            table.addHeaderCell("Warehouse");
            table.addHeaderCell("Current Stock");
            table.addHeaderCell("Threshold");
            table.addHeaderCell("Shortage");
            table.addHeaderCell("Days Until Out");
            table.addHeaderCell("Priority");
            
            for (LowStockReportResponse.LowStockItem item : report.getLowStockItems()) {
                table.addCell(item.getSkuId());
                table.addCell(item.getProductName());
                table.addCell(item.getCategory());
                table.addCell(item.getWarehouseId());
                table.addCell(String.valueOf(item.getCurrentStock()));
                table.addCell(String.valueOf(item.getThreshold()));
                table.addCell(String.valueOf(item.getShortage()));
                table.addCell(String.valueOf(item.getDaysUntilOut()));
                table.addCell(item.getPriority());
            }
            document.add(table);
        }
        
        document.close();
        return baos.toByteArray();
    }
    
    /**
     * Generate XLSX file for Inventory Valuation Report
     */
    public byte[] generateInventoryValuationXLSX(InventoryValuationReportResponse report) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Inventory Valuation");
        
        int rowNum = 0;
        Row row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue(report.getReportName());
        
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Generated: " + report.getGeneratedDate());
        
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Period: " + report.getStartDate() + " to " + report.getEndDate());
        
        rowNum++;
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Total Valuation: $" + report.getTotalValuation());
        
        rowNum++;
        // Warehouse Summary
        if (report.getWarehouseValuations() != null && !report.getWarehouseValuations().isEmpty()) {
            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Warehouse Summary");
            
            Row headerRow = sheet.createRow(rowNum++);
            headerRow.createCell(0).setCellValue("Warehouse ID");
            headerRow.createCell(1).setCellValue("Warehouse Name");
            headerRow.createCell(2).setCellValue("Total Products");
            headerRow.createCell(3).setCellValue("Total Quantity");
            headerRow.createCell(4).setCellValue("Total Value");
            
            for (InventoryValuationReportResponse.WarehouseValuation wv : report.getWarehouseValuations()) {
                row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(wv.getWarehouseId());
                row.createCell(1).setCellValue(wv.getWarehouseName());
                row.createCell(2).setCellValue(wv.getTotalProducts());
                row.createCell(3).setCellValue(wv.getTotalQuantity());
                row.createCell(4).setCellValue(wv.getTotalValue().doubleValue());
            }
            rowNum++;
        }
        
        // Product Details
        if (report.getProductValuations() != null && !report.getProductValuations().isEmpty()) {
            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Product Details");
            
            Row headerRow = sheet.createRow(rowNum++);
            headerRow.createCell(0).setCellValue("SKU");
            headerRow.createCell(1).setCellValue("Product Name");
            headerRow.createCell(2).setCellValue("Category");
            headerRow.createCell(3).setCellValue("Warehouse");
            headerRow.createCell(4).setCellValue("Quantity");
            headerRow.createCell(5).setCellValue("Unit Price");
            headerRow.createCell(6).setCellValue("Total Value");
            
            for (InventoryValuationReportResponse.ProductValuation pv : report.getProductValuations()) {
                row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(pv.getSkuId());
                row.createCell(1).setCellValue(pv.getProductName());
                row.createCell(2).setCellValue(pv.getCategory());
                row.createCell(3).setCellValue(pv.getWarehouseId());
                row.createCell(4).setCellValue(pv.getQuantity());
                row.createCell(5).setCellValue(pv.getUnitPrice().doubleValue());
                row.createCell(6).setCellValue(pv.getTotalValue().doubleValue());
            }
        }
        
        // Auto-size columns
        for (int i = 0; i < 7; i++) {
            sheet.autoSizeColumn(i);
        }
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        return baos.toByteArray();
    }
    
    /**
     * Generate XLSX file for Low Stock Report
     */
    public byte[] generateLowStockXLSX(LowStockReportResponse report) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Low Stock Report");
        
        int rowNum = 0;
        Row row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue(report.getReportName());
        
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Generated: " + report.getGeneratedDate());
        
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Period: " + report.getStartDate() + " to " + report.getEndDate());
        
        rowNum++;
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Total Low Stock Items: " + report.getTotalLowStockItems());
        
        rowNum++;
        // Header
        Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("SKU");
        headerRow.createCell(1).setCellValue("Product Name");
        headerRow.createCell(2).setCellValue("Category");
        headerRow.createCell(3).setCellValue("Warehouse");
        headerRow.createCell(4).setCellValue("Current Stock");
        headerRow.createCell(5).setCellValue("Threshold");
        headerRow.createCell(6).setCellValue("Shortage");
        headerRow.createCell(7).setCellValue("Days Until Out");
        headerRow.createCell(8).setCellValue("Priority");
        
        // Data rows
        if (report.getLowStockItems() != null) {
            for (LowStockReportResponse.LowStockItem item : report.getLowStockItems()) {
                row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(item.getSkuId());
                row.createCell(1).setCellValue(item.getProductName());
                row.createCell(2).setCellValue(item.getCategory());
                row.createCell(3).setCellValue(item.getWarehouseId());
                row.createCell(4).setCellValue(item.getCurrentStock());
                row.createCell(5).setCellValue(item.getThreshold());
                row.createCell(6).setCellValue(item.getShortage());
                row.createCell(7).setCellValue(item.getDaysUntilOut());
                row.createCell(8).setCellValue(item.getPriority());
            }
        }
        
        // Auto-size columns
        for (int i = 0; i < 9; i++) {
            sheet.autoSizeColumn(i);
        }
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        return baos.toByteArray();
    }
    
    /**
     * Generate CSV file for Inventory Valuation Report
     */
    public byte[] generateInventoryValuationCSV(InventoryValuationReportResponse report) throws IOException {
        StringBuilder csv = new StringBuilder();
        
        // Header
        csv.append("Report: ").append(report.getReportName()).append("\n");
        csv.append("Generated: ").append(report.getGeneratedDate()).append("\n");
        csv.append("Period: ").append(report.getStartDate()).append(" to ").append(report.getEndDate()).append("\n");
        csv.append("Total Valuation: $").append(report.getTotalValuation()).append("\n\n");
        
        // Warehouse Summary
        csv.append("Warehouse Summary\n");
        csv.append("Warehouse ID,Warehouse Name,Total Products,Total Quantity,Total Value\n");
        if (report.getWarehouseValuations() != null) {
            for (InventoryValuationReportResponse.WarehouseValuation wv : report.getWarehouseValuations()) {
                csv.append(wv.getWarehouseId()).append(",")
                   .append(wv.getWarehouseName()).append(",")
                   .append(wv.getTotalProducts()).append(",")
                   .append(wv.getTotalQuantity()).append(",")
                   .append(wv.getTotalValue()).append("\n");
            }
        }
        csv.append("\n");
        
        // Product Details
        csv.append("Product Details\n");
        csv.append("SKU,Product Name,Category,Warehouse,Quantity,Unit Price,Total Value\n");
        if (report.getProductValuations() != null) {
            for (InventoryValuationReportResponse.ProductValuation pv : report.getProductValuations()) {
                csv.append(pv.getSkuId()).append(",")
                   .append("\"").append(pv.getProductName()).append("\"").append(",")
                   .append(pv.getCategory()).append(",")
                   .append(pv.getWarehouseId()).append(",")
                   .append(pv.getQuantity()).append(",")
                   .append(pv.getUnitPrice()).append(",")
                   .append(pv.getTotalValue()).append("\n");
            }
        }
        
        return csv.toString().getBytes("UTF-8");
    }
    
    /**
     * Generate CSV file for Low Stock Report
     */
    public byte[] generateLowStockCSV(LowStockReportResponse report) throws IOException {
        StringBuilder csv = new StringBuilder();
        
        // Header
        csv.append("Report: ").append(report.getReportName()).append("\n");
        csv.append("Generated: ").append(report.getGeneratedDate()).append("\n");
        csv.append("Period: ").append(report.getStartDate()).append(" to ").append(report.getEndDate()).append("\n");
        csv.append("Total Low Stock Items: ").append(report.getTotalLowStockItems()).append("\n\n");
        
        // Data
        csv.append("SKU,Product Name,Category,Warehouse,Current Stock,Threshold,Shortage,Days Until Out,Priority\n");
        if (report.getLowStockItems() != null) {
            for (LowStockReportResponse.LowStockItem item : report.getLowStockItems()) {
                csv.append(item.getSkuId()).append(",")
                   .append("\"").append(item.getProductName()).append("\"").append(",")
                   .append(item.getCategory()).append(",")
                   .append(item.getWarehouseId()).append(",")
                   .append(item.getCurrentStock()).append(",")
                   .append(item.getThreshold()).append(",")
                   .append(item.getShortage()).append(",")
                   .append(item.getDaysUntilOut()).append(",")
                   .append(item.getPriority()).append("\n");
            }
        }
        
        return csv.toString().getBytes("UTF-8");
    }
    
    /**
     * Generate PDF file for Full Inventory Export
     */
    public byte[] generateFullInventoryPDF(FullInventoryExportResponse report) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        
        // Title
        document.add(new Paragraph(report.getReportName()).setBold().setFontSize(18));
        document.add(new Paragraph("Generated: " + report.getGeneratedDate()).setFontSize(10));
        document.add(new Paragraph("Period: " + report.getStartDate() + " to " + report.getEndDate()).setFontSize(10));
        document.add(new Paragraph(" "));
        
        // Summary
        document.add(new Paragraph("Total Products: " + report.getTotalProducts()).setBold().setFontSize(12));
        document.add(new Paragraph("Total Quantity: " + report.getTotalQuantity()).setBold().setFontSize(12));
        document.add(new Paragraph("Total Value: $" + report.getTotalValue()).setBold().setFontSize(12));
        document.add(new Paragraph(" "));
        
        // Products Table
        if (report.getItems() != null && !report.getItems().isEmpty()) {
            Table table = new Table(UnitValue.createPercentArray(new float[]{2, 3, 2, 2, 2, 2, 2, 2, 2}));
            table.addHeaderCell("SKU");
            table.addHeaderCell("Product Name");
            table.addHeaderCell("Category");
            table.addHeaderCell("Warehouse");
            table.addHeaderCell("Quantity");
            table.addHeaderCell("Unit Price");
            table.addHeaderCell("Total Value");
            table.addHeaderCell("Storage Type");
            table.addHeaderCell("Dosage Form");
            
            for (FullInventoryExportResponse.InventoryItem item : report.getItems()) {
                table.addCell(item.getSkuId());
                table.addCell(item.getProductName());
                table.addCell(item.getCategory());
                table.addCell(item.getWarehouseId());
                table.addCell(String.valueOf(item.getQuantity()));
                table.addCell("$" + item.getPrice());
                table.addCell("$" + item.getTotalValue());
                table.addCell(item.getStorageType());
                table.addCell(item.getDosageForm());
            }
            document.add(table);
        }
        
        document.close();
        return baos.toByteArray();
    }
    
    /**
     * Generate XLSX file for Full Inventory Export
     */
    public byte[] generateFullInventoryXLSX(FullInventoryExportResponse report) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Full Inventory");
        
        int rowNum = 0;
        Row row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue(report.getReportName());
        
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Generated: " + report.getGeneratedDate());
        
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Period: " + report.getStartDate() + " to " + report.getEndDate());
        
        rowNum++;
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Total Products: " + report.getTotalProducts());
        
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Total Quantity: " + report.getTotalQuantity());
        
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Total Value: $" + report.getTotalValue());
        
        rowNum++;
        // Header
        Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("SKU");
        headerRow.createCell(1).setCellValue("Product Name");
        headerRow.createCell(2).setCellValue("Category");
        headerRow.createCell(3).setCellValue("Warehouse");
        headerRow.createCell(4).setCellValue("Quantity");
        headerRow.createCell(5).setCellValue("Unit Price");
        headerRow.createCell(6).setCellValue("Total Value");
        headerRow.createCell(7).setCellValue("Storage Type");
        headerRow.createCell(8).setCellValue("Dosage Form");
        
        // Data rows
        if (report.getItems() != null) {
            for (FullInventoryExportResponse.InventoryItem item : report.getItems()) {
                row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(item.getSkuId());
                row.createCell(1).setCellValue(item.getProductName());
                row.createCell(2).setCellValue(item.getCategory());
                row.createCell(3).setCellValue(item.getWarehouseId());
                row.createCell(4).setCellValue(item.getQuantity());
                row.createCell(5).setCellValue(item.getPrice().doubleValue());
                row.createCell(6).setCellValue(item.getTotalValue().doubleValue());
                row.createCell(7).setCellValue(item.getStorageType());
                row.createCell(8).setCellValue(item.getDosageForm());
            }
        }
        
        // Auto-size columns
        for (int i = 0; i < 9; i++) {
            sheet.autoSizeColumn(i);
        }
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        return baos.toByteArray();
    }
    
    /**
     * Generate CSV file for Full Inventory Export
     */
    public byte[] generateFullInventoryCSV(FullInventoryExportResponse report) throws IOException {
        StringBuilder csv = new StringBuilder();
        
        // Header
        csv.append("Report: ").append(report.getReportName()).append("\n");
        csv.append("Generated: ").append(report.getGeneratedDate()).append("\n");
        csv.append("Period: ").append(report.getStartDate()).append(" to ").append(report.getEndDate()).append("\n");
        csv.append("Total Products: ").append(report.getTotalProducts()).append("\n");
        csv.append("Total Quantity: ").append(report.getTotalQuantity()).append("\n");
        csv.append("Total Value: $").append(report.getTotalValue()).append("\n\n");
        
        // Data
        csv.append("SKU,Product Name,Category,Warehouse,Quantity,Unit Price,Total Value,Storage Type,Dosage Form\n");
        if (report.getItems() != null) {
            for (FullInventoryExportResponse.InventoryItem item : report.getItems()) {
                csv.append(item.getSkuId()).append(",")
                   .append("\"").append(item.getProductName()).append("\"").append(",")
                   .append(item.getCategory()).append(",")
                   .append(item.getWarehouseId()).append(",")
                   .append(item.getQuantity()).append(",")
                   .append(item.getPrice()).append(",")
                   .append(item.getTotalValue()).append(",")
                   .append(item.getStorageType()).append(",")
                   .append(item.getDosageForm()).append("\n");
            }
        }
        
        return csv.toString().getBytes("UTF-8");
    }
    
    /**
     * Generate PDF file for Expiry Data Export
     */
    public byte[] generateExpiryDataPDF(ExpiryDataExportResponse report) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        
        // Title
        document.add(new Paragraph(report.getReportName()).setBold().setFontSize(18));
        document.add(new Paragraph("Generated: " + report.getGeneratedDate()).setFontSize(10));
        document.add(new Paragraph("Period: " + report.getStartDate() + " to " + report.getEndDate()).setFontSize(10));
        document.add(new Paragraph(" "));
        
        // Summary
        document.add(new Paragraph("Total Batches: " + report.getTotalBatches()).setBold().setFontSize(12));
        document.add(new Paragraph("Expiring Soon: " + report.getExpiringSoonCount()).setBold().setFontSize(12));
        document.add(new Paragraph("Expired: " + report.getExpiredCount()).setBold().setFontSize(12));
        document.add(new Paragraph(" "));
        
        // Batches Table
        if (report.getItems() != null && !report.getItems().isEmpty()) {
            Table table = new Table(UnitValue.createPercentArray(new float[]{2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2}));
            table.addHeaderCell("Batch ID");
            table.addHeaderCell("SKU");
            table.addHeaderCell("Product Name");
            table.addHeaderCell("Category");
            table.addHeaderCell("Warehouse");
            table.addHeaderCell("Expiry Date");
            table.addHeaderCell("Days Until Expiry");
            table.addHeaderCell("Status");
            table.addHeaderCell("Quantity");
            table.addHeaderCell("Persona Type");
            
            for (ExpiryDataExportResponse.ExpiryItem item : report.getItems()) {
                table.addCell(item.getBatchId());
                table.addCell(item.getSkuId());
                table.addCell(item.getProductName());
                table.addCell(item.getCategory());
                table.addCell(item.getWarehouseId());
                table.addCell(item.getExpiry().toString());
                table.addCell(String.valueOf(item.getDaysUntilExpiry()));
                table.addCell(item.getStatus());
                table.addCell(String.valueOf(item.getQuantity()));
                table.addCell(item.getPersonaType());
            }
            document.add(table);
        }
        
        document.close();
        return baos.toByteArray();
    }
    
    /**
     * Generate XLSX file for Expiry Data Export
     */
    public byte[] generateExpiryDataXLSX(ExpiryDataExportResponse report) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Expiry Data");
        
        int rowNum = 0;
        Row row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue(report.getReportName());
        
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Generated: " + report.getGeneratedDate());
        
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Period: " + report.getStartDate() + " to " + report.getEndDate());
        
        rowNum++;
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Total Batches: " + report.getTotalBatches());
        
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Expiring Soon: " + report.getExpiringSoonCount());
        
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Expired: " + report.getExpiredCount());
        
        rowNum++;
        // Header
        Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("Batch ID");
        headerRow.createCell(1).setCellValue("SKU");
        headerRow.createCell(2).setCellValue("Product Name");
        headerRow.createCell(3).setCellValue("Category");
        headerRow.createCell(4).setCellValue("Warehouse");
        headerRow.createCell(5).setCellValue("Expiry Date");
        headerRow.createCell(6).setCellValue("Days Until Expiry");
        headerRow.createCell(7).setCellValue("Status");
        headerRow.createCell(8).setCellValue("Quantity");
        headerRow.createCell(9).setCellValue("Persona Type");
        
        // Data rows
        if (report.getItems() != null) {
            for (ExpiryDataExportResponse.ExpiryItem item : report.getItems()) {
                row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(item.getBatchId());
                row.createCell(1).setCellValue(item.getSkuId());
                row.createCell(2).setCellValue(item.getProductName());
                row.createCell(3).setCellValue(item.getCategory());
                row.createCell(4).setCellValue(item.getWarehouseId());
                row.createCell(5).setCellValue(item.getExpiry().toString());
                row.createCell(6).setCellValue(item.getDaysUntilExpiry());
                row.createCell(7).setCellValue(item.getStatus());
                row.createCell(8).setCellValue(item.getQuantity());
                row.createCell(9).setCellValue(item.getPersonaType());
            }
        }
        
        // Auto-size columns
        for (int i = 0; i < 10; i++) {
            sheet.autoSizeColumn(i);
        }
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        return baos.toByteArray();
    }
    
    /**
     * Generate CSV file for Expiry Data Export
     */
    public byte[] generateExpiryDataCSV(ExpiryDataExportResponse report) throws IOException {
        StringBuilder csv = new StringBuilder();
        
        // Header
        csv.append("Report: ").append(report.getReportName()).append("\n");
        csv.append("Generated: ").append(report.getGeneratedDate()).append("\n");
        csv.append("Period: ").append(report.getStartDate()).append(" to ").append(report.getEndDate()).append("\n");
        csv.append("Total Batches: ").append(report.getTotalBatches()).append("\n");
        csv.append("Expiring Soon: ").append(report.getExpiringSoonCount()).append("\n");
        csv.append("Expired: ").append(report.getExpiredCount()).append("\n\n");
        
        // Data
        csv.append("Batch ID,SKU,Product Name,Category,Warehouse,Expiry Date,Days Until Expiry,Status,Quantity,Persona Type\n");
        if (report.getItems() != null) {
            for (ExpiryDataExportResponse.ExpiryItem item : report.getItems()) {
                csv.append(item.getBatchId()).append(",")
                   .append(item.getSkuId()).append(",")
                   .append("\"").append(item.getProductName()).append("\"").append(",")
                   .append(item.getCategory()).append(",")
                   .append(item.getWarehouseId()).append(",")
                   .append(item.getExpiry().toString()).append(",")
                   .append(item.getDaysUntilExpiry()).append(",")
                   .append(item.getStatus()).append(",")
                   .append(item.getQuantity()).append(",")
                   .append(item.getPersonaType()).append("\n");
            }
        }
        
        return csv.toString().getBytes("UTF-8");
    }
    
    /**
     * Generate PDF file for Purchase Order Export
     */
    public byte[] generatePurchaseOrderPDF(PurchaseOrderExportResponse report) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        
        // Title
        document.add(new Paragraph(report.getReportName()).setBold().setFontSize(18));
        document.add(new Paragraph("Generated: " + report.getGeneratedDate()).setFontSize(10));
        document.add(new Paragraph("Period: " + report.getStartDate() + " to " + report.getEndDate()).setFontSize(10));
        document.add(new Paragraph(" "));
        
        // Summary
        document.add(new Paragraph("Total Purchase Orders: " + report.getTotalPurchaseOrders()).setBold().setFontSize(12));
        document.add(new Paragraph("Total Amount: $" + report.getTotalAmount()).setBold().setFontSize(12));
        document.add(new Paragraph("Pending: " + report.getPendingCount()).setBold().setFontSize(12));
        document.add(new Paragraph("Approved: " + report.getApprovedCount()).setBold().setFontSize(12));
        document.add(new Paragraph("Rejected: " + report.getRejectedCount()).setBold().setFontSize(12));
        document.add(new Paragraph(" "));
        
        // Purchase Orders Table
        if (report.getItems() != null && !report.getItems().isEmpty()) {
            Table table = new Table(UnitValue.createPercentArray(new float[]{1.5f, 2, 1.5f, 1.5f, 2, 2, 2, 2, 2}));
            table.addHeaderCell("PO Number");
            table.addHeaderCell("Order ID");
            table.addHeaderCell("Status");
            table.addHeaderCell("Total Amount");
            table.addHeaderCell("Comments");
            table.addHeaderCell("Approved/Rejected By");
            table.addHeaderCell("Created At");
            table.addHeaderCell("Approved/Rejected At");
            table.addHeaderCell("Updated At");
            
            for (PurchaseOrderExportResponse.PurchaseOrderItem item : report.getItems()) {
                table.addCell(item.getPoNumber() != null ? item.getPoNumber() : "");
                table.addCell(item.getOrderId() != null ? item.getOrderId().toString() : "");
                table.addCell(item.getStatus() != null ? item.getStatus() : "");
                table.addCell(item.getTotalAmount() != null ? "$" + item.getTotalAmount() : "");
                table.addCell(item.getComments() != null ? item.getComments() : "");
                table.addCell(item.getApprovedRejectedBy() != null ? item.getApprovedRejectedBy() : "");
                table.addCell(item.getCreatedAt() != null ? item.getCreatedAt().toString() : "");
                table.addCell(item.getApprovedRejectedAt() != null ? item.getApprovedRejectedAt().toString() : "");
                table.addCell(item.getUpdatedAt() != null ? item.getUpdatedAt().toString() : "");
            }
            document.add(table);
        }
        
        document.close();
        return baos.toByteArray();
    }
    
    /**
     * Generate XLSX file for Purchase Order Export
     */
    public byte[] generatePurchaseOrderXLSX(PurchaseOrderExportResponse report) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Purchase Orders");
        
        int rowNum = 0;
        Row row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue(report.getReportName());
        
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Generated: " + report.getGeneratedDate());
        
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Period: " + report.getStartDate() + " to " + report.getEndDate());
        
        rowNum++;
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Total Purchase Orders: " + report.getTotalPurchaseOrders());
        
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Total Amount: $" + report.getTotalAmount());
        
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Pending: " + report.getPendingCount());
        
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Approved: " + report.getApprovedCount());
        
        row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue("Rejected: " + report.getRejectedCount());
        
        rowNum++;
        // Header
        Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("PO Number");
        headerRow.createCell(1).setCellValue("Order ID");
        headerRow.createCell(2).setCellValue("Status");
        headerRow.createCell(3).setCellValue("Total Amount");
        headerRow.createCell(4).setCellValue("Comments");
        headerRow.createCell(5).setCellValue("Approved/Rejected By");
        headerRow.createCell(6).setCellValue("Created At");
        headerRow.createCell(7).setCellValue("Approved/Rejected At");
        headerRow.createCell(8).setCellValue("Updated At");
        
        // Data rows
        if (report.getItems() != null) {
            for (PurchaseOrderExportResponse.PurchaseOrderItem item : report.getItems()) {
                row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(item.getPoNumber() != null ? item.getPoNumber() : "");
                row.createCell(1).setCellValue(item.getOrderId() != null ? item.getOrderId() : 0);
                row.createCell(2).setCellValue(item.getStatus() != null ? item.getStatus() : "");
                row.createCell(3).setCellValue(item.getTotalAmount() != null ? item.getTotalAmount().doubleValue() : 0);
                row.createCell(4).setCellValue(item.getComments() != null ? item.getComments() : "");
                row.createCell(5).setCellValue(item.getApprovedRejectedBy() != null ? item.getApprovedRejectedBy() : "");
                row.createCell(6).setCellValue(item.getCreatedAt() != null ? item.getCreatedAt().toString() : "");
                row.createCell(7).setCellValue(item.getApprovedRejectedAt() != null ? item.getApprovedRejectedAt().toString() : "");
                row.createCell(8).setCellValue(item.getUpdatedAt() != null ? item.getUpdatedAt().toString() : "");
            }
        }
        
        // Auto-size columns
        for (int i = 0; i < 9; i++) {
            sheet.autoSizeColumn(i);
        }
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        return baos.toByteArray();
    }
    
    /**
     * Generate CSV file for Purchase Order Export
     */
    public byte[] generatePurchaseOrderCSV(PurchaseOrderExportResponse report) throws IOException {
        StringBuilder csv = new StringBuilder();
        
        // Header
        csv.append("Report: ").append(report.getReportName()).append("\n");
        csv.append("Generated: ").append(report.getGeneratedDate()).append("\n");
        csv.append("Period: ").append(report.getStartDate()).append(" to ").append(report.getEndDate()).append("\n");
        csv.append("Total Purchase Orders: ").append(report.getTotalPurchaseOrders()).append("\n");
        csv.append("Total Amount: $").append(report.getTotalAmount()).append("\n");
        csv.append("Pending: ").append(report.getPendingCount()).append("\n");
        csv.append("Approved: ").append(report.getApprovedCount()).append("\n");
        csv.append("Rejected: ").append(report.getRejectedCount()).append("\n\n");
        
        // Data
        csv.append("PO Number,Order ID,Status,Total Amount,Comments,Approved/Rejected By,Created At,Approved/Rejected At,Updated At\n");
        if (report.getItems() != null) {
            for (PurchaseOrderExportResponse.PurchaseOrderItem item : report.getItems()) {
                csv.append(item.getPoNumber() != null ? item.getPoNumber() : "").append(",")
                   .append(item.getOrderId() != null ? item.getOrderId() : "").append(",")
                   .append(item.getStatus() != null ? item.getStatus() : "").append(",")
                   .append(item.getTotalAmount() != null ? item.getTotalAmount() : "").append(",")
                   .append(item.getComments() != null ? "\"" + item.getComments().replace("\"", "\"\"") + "\"" : "").append(",")
                   .append(item.getApprovedRejectedBy() != null ? item.getApprovedRejectedBy() : "").append(",")
                   .append(item.getCreatedAt() != null ? item.getCreatedAt().toString() : "").append(",")
                   .append(item.getApprovedRejectedAt() != null ? item.getApprovedRejectedAt().toString() : "").append(",")
                   .append(item.getUpdatedAt() != null ? item.getUpdatedAt().toString() : "").append("\n");
            }
        }
        
        return csv.toString().getBytes("UTF-8");
    }
}
