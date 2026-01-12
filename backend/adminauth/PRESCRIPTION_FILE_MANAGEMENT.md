# Prescription File Management Guide

## Overview

The system now supports **file upload and download** for prescription files. Files are stored on the server filesystem and can be accessed via API endpoints.

## How It Works

### Current Implementation

1. **File Storage**: Files are stored in the `uploads/prescriptions/` directory on the server
2. **Database**: Only the file URL/path is stored in the database (in the `file_url` column)
3. **File Access**: Files can be downloaded/viewed via API endpoints

### Two Types of File URLs

1. **Stored Files** (uploaded via API):
   - URL format: `/api/prescriptions/{id}/file/{fileName}`
   - Example: `/api/prescriptions/1/file/abc123-def456-ghi789.pdf`
   - These files are stored on the server and can be accessed directly

2. **External URLs** (provided during creation):
   - URL format: `https://example.com/prescription.pdf`
   - These are external URLs that redirect to the external location

## API Endpoints

### 1. Upload Prescription File

**Endpoint:** `POST /api/prescriptions/{id}/upload-file`

**Description:** Upload a file for an existing prescription

**Headers:**
```
Content-Type: application/octet-stream
X-File-Name: prescription.pdf
```

**Request Body:** Binary file content

**Example using cURL:**
```bash
curl -X POST http://localhost:9090/api/prescriptions/1/upload-file \
  -H "Content-Type: application/octet-stream" \
  -H "X-File-Name: prescription.pdf" \
  --data-binary "@/path/to/prescription.pdf"
```

**Example using PowerShell:**
```powershell
$fileContent = [System.IO.File]::ReadAllBytes("C:\path\to\prescription.pdf")
$headers = @{
    "Content-Type" = "application/octet-stream"
    "X-File-Name" = "prescription.pdf"
}
Invoke-RestMethod -Uri "http://localhost:9090/api/prescriptions/1/upload-file" `
    -Method POST `
    -Headers $headers `
    -Body $fileContent
```

**Response:**
```json
{
  "id": 1,
  "user": {...},
  "fileUrl": "/api/prescriptions/1/file/abc123-def456-ghi789.pdf",
  ...
}
```

### 2. Download/View Prescription File (by ID)

**Endpoint:** `GET /api/prescriptions/{id}/file`

**Description:** Get the file associated with a prescription (automatically handles stored files and external URLs)

**Example:**
```bash
curl http://localhost:9090/api/prescriptions/1/file --output prescription.pdf
```

**In Browser:**
```
http://localhost:9090/api/prescriptions/1/file
```
The file will open directly in the browser (PDF viewer, image viewer, etc.)

### 3. Download Prescription File (by filename)

**Endpoint:** `GET /api/prescriptions/{id}/file/{fileName}`

**Description:** Download a specific file by its stored filename

**Example:**
```bash
curl http://localhost:9090/api/prescriptions/1/file/abc123-def456-ghi789.pdf --output prescription.pdf
```

## Usage Examples

### Complete Workflow

#### Step 1: Create Prescription (without file)
```json
POST /api/prescriptions
{
  "userId": 5,
  "doctorName": "Dr. Smith",
  "prescriptionDate": "2026-01-08",
  "validUntil": "2026-02-08",
  "fileUrl": ""  // Will be updated after upload
}
```

#### Step 2: Upload File
```bash
curl -X POST http://localhost:9090/api/prescriptions/1/upload-file \
  -H "Content-Type: application/octet-stream" \
  -H "X-File-Name: prescription.pdf" \
  --data-binary "@prescription.pdf"
```

#### Step 3: View File
Open in browser: `http://localhost:9090/api/prescriptions/1/file`

### Using External URLs

If you already have a file hosted elsewhere, you can provide the URL directly:

```json
POST /api/prescriptions
{
  "userId": 5,
  "doctorName": "Dr. Smith",
  "prescriptionDate": "2026-01-08",
  "validUntil": "2026-02-08",
  "fileUrl": "https://storage.example.com/prescriptions/prescription-123.pdf"
}
```

When accessing `/api/prescriptions/1/file`, the system will redirect to the external URL.

## File Storage Details

- **Storage Location**: `uploads/prescriptions/` (relative to application root)
- **File Naming**: Files are stored with UUID-based names to prevent conflicts
- **Supported Formats**: PDF, images (JPG, PNG, GIF), documents (DOC, DOCX), etc.
- **Content Types**: Automatically detected based on file extension

## Answer to Your Question

**"If we have prescription URL and if the file is present in the database, can it open?"**

**Answer:** Yes! Here's how:

1. **If file is stored on server** (uploaded via API):
   - The `fileUrl` in database will be like: `/api/prescriptions/1/file/abc123.pdf`
   - You can open it directly: `http://localhost:9090/api/prescriptions/1/file`
   - The file will open in browser (PDF viewer, image viewer, etc.)

2. **If file is external URL**:
   - The `fileUrl` in database will be like: `https://example.com/prescription.pdf`
   - Accessing `/api/prescriptions/1/file` will redirect to the external URL
   - The file will open from the external location

3. **To check if file exists**:
   - Call `GET /api/prescriptions/{id}/file`
   - If file exists, it will be returned
   - If file doesn't exist, you'll get a 404 error

## Testing

### Test File Upload
```powershell
# Create a test PDF file (or use existing)
$testFile = "test-prescription.pdf"

# Upload it
$fileContent = [System.IO.File]::ReadAllBytes($testFile)
$headers = @{
    "Content-Type" = "application/octet-stream"
    "X-File-Name" = "test-prescription.pdf"
}
$response = Invoke-RestMethod -Uri "http://localhost:9090/api/prescriptions/1/upload-file" `
    -Method POST `
    -Headers $headers `
    -Body $fileContent

Write-Host "File uploaded! URL: $($response.fileUrl)"
```

### Test File Download
```powershell
# Download file
Invoke-WebRequest -Uri "http://localhost:9090/api/prescriptions/1/file" `
    -OutFile "downloaded-prescription.pdf"

Write-Host "File downloaded!"
```

## Notes

- Files are stored permanently until manually deleted
- File size limits depend on server configuration
- For production, consider using cloud storage (S3, Azure Blob, etc.) instead of local filesystem
- The `fileUrl` field in the database can store either:
  - Internal file path (for uploaded files)
  - External URL (for files hosted elsewhere)
