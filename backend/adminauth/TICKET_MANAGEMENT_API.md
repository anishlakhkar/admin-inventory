# Ticket Management System API Documentation

## Overview
Complete backend API for a Ticket Management System with role-based access control, workflow management, and history tracking.

## Database Schema

### Tables Created
1. **tickets** - Main ticket table
2. **ticket_history** - Tracks all status and assignee changes
3. **ticket_comments** - User comments on tickets
4. **ticket_attachments** - File attachments for tickets

### Relationships
- `tickets.raised_by` → `users.id`
- `tickets.assigned_to` → `users.id`
- `ticket_history.ticket_id` → `tickets.ticket_id`
- `ticket_comments.ticket_id` → `tickets.ticket_id`
- `ticket_attachments.ticket_id` → `tickets.ticket_id`

## API Endpoints

### Base URL: `/api/tickets`

### 1. Create Ticket
**POST** `/api/tickets`
- **Auth Required:** Yes (B2B, B2C, WAREHOUSE, ADMIN)
- **Request Body:**
```json
{
  "title": "Ticket Title",
  "description": "Ticket description",
  "ticketType": "B2B",
  "priority": "HIGH"
}
```
- **Response:** 201 Created with TicketResponse
- **Workflow:** Creates ticket with status=OPEN, assigned_to=ADMIN

### 2. Get Ticket by ID
**GET** `/api/tickets/{id}`
- **Auth Required:** No
- **Response:** 200 OK with TicketResponse

### 3. List Tickets (with filters)
**GET** `/api/tickets?status=OPEN&priority=HIGH&ticketType=B2B&assignedTo=1`
- **Auth Required:** No
- **Query Parameters:**
  - `status`: OPEN, IN_PROGRESS, RESOLVED, CLOSED
  - `priority`: CRITICAL, HIGH, MEDIUM, LOW
  - `ticketType`: B2B, B2C, WAREHOUSE
  - `assignedTo`: User ID
- **Response:** 200 OK with List<TicketResponse>

### 4. Assign Ticket to Executive
**PUT** `/api/tickets/{id}/assign`
- **Auth Required:** Yes (ADMIN only)
- **Request Body:**
```json
{
  "executiveId": 5,
  "comment": "Assigning to executive"
}
```
- **Response:** 200 OK with TicketResponse
- **Workflow:** Changes status from OPEN to IN_PROGRESS

### 5. Admin Resolve Ticket
**PUT** `/api/tickets/{id}/resolve`
- **Auth Required:** Yes (ADMIN only)
- **Request Body:**
```json
{
  "status": "RESOLVED",
  "comment": "Resolved by admin"
}
```
- **Response:** 200 OK with TicketResponse

### 6. Executive Update Ticket Status
**PUT** `/api/tickets/{id}/status`
- **Auth Required:** Yes (EXECUTIVE only)
- **Request Body:**
```json
{
  "status": "IN_PROGRESS",
  "comment": "Working on it"
}
```
- **Response:** 200 OK with TicketResponse
- **Validation:** Executive can only update tickets assigned to them

### 7. Executive Resolve Ticket
**PUT** `/api/tickets/{id}/resolve-executive`
- **Auth Required:** Yes (EXECUTIVE only)
- **Request Body:**
```json
{
  "status": "RESOLVED",
  "comment": "Issue resolved"
}
```
- **Response:** 200 OK with TicketResponse

### 8. Admin Close Ticket
**PUT** `/api/tickets/{id}/close`
- **Auth Required:** Yes (ADMIN only)
- **Request Body:**
```json
{
  "status": "CLOSED",
  "comment": "Ticket closed"
}
```
- **Response:** 200 OK with TicketResponse
- **Validation:** Can only close RESOLVED tickets

### 9. Add Comment
**POST** `/api/tickets/{id}/comments`
- **Auth Required:** Yes
- **Request Body:**
```json
{
  "comment": "This is a comment"
}
```
- **Response:** 201 Created with TicketCommentResponse

### 10. Add Attachment
**POST** `/api/tickets/{id}/attachments`
- **Auth Required:** Yes
- **Request Body:**
```json
{
  "fileUrl": "https://example.com/file.pdf",
  "fileName": "document.pdf",
  "fileSize": 1024
}
```
- **Response:** 201 Created with TicketAttachmentResponse

### 11. Get Ticket History
**GET** `/api/tickets/{id}/history`
- **Auth Required:** No
- **Response:** 200 OK with List<TicketHistoryResponse>
- **Description:** Returns all status and assignee changes

### 12. Get Ticket Comments
**GET** `/api/tickets/{id}/comments`
- **Auth Required:** No
- **Response:** 200 OK with List<TicketCommentResponse>

### 13. Get Ticket Attachments
**GET** `/api/tickets/{id}/attachments`
- **Auth Required:** No
- **Response:** 200 OK with List<TicketAttachmentResponse>

## Workflow Rules

### Status Transitions
1. **OPEN** → Can be assigned to Executive (becomes IN_PROGRESS)
2. **OPEN** → Can be resolved by Admin (becomes RESOLVED)
3. **IN_PROGRESS** → Can be updated by Executive
4. **IN_PROGRESS** → Can be resolved by Executive (becomes RESOLVED)
5. **RESOLVED** → Can be closed by Admin (becomes CLOSED)
6. **CLOSED** → Final state, no further changes

### Authorization Rules
- **Create Ticket:** ADMIN, B2B, B2C, WAREHOUSE
- **Assign Ticket:** ADMIN only
- **Resolve Ticket:** ADMIN or EXECUTIVE (assigned tickets only)
- **Close Ticket:** ADMIN only
- **Update Status:** EXECUTIVE (only assigned tickets)

## History Tracking
Every change to:
- `status` → Creates history entry
- `assigned_to` → Creates history entry

History entries include:
- Old and new status
- Old and new assignee
- Action by (user who made the change)
- Optional comment
- Timestamp

## Validation Rules
1. `ticketType` must be: B2B, B2C, or WAREHOUSE
2. `priority` must be: CRITICAL, HIGH, MEDIUM, or LOW
3. `status` transitions must follow workflow
4. Only Admin can close tickets
5. Only Admin or Executive can resolve tickets
6. Executive can only update tickets assigned to them

## Example Request/Response

### Create Ticket Request
```bash
POST /api/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Server Down Issue",
  "description": "Production server is not responding",
  "ticketType": "B2B",
  "priority": "CRITICAL"
}
```

### Create Ticket Response
```json
{
  "ticketId": 1,
  "raisedBy": {
    "id": 3,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "accountStatus": "ACTIVE",
    "userTypes": ["B2B"]
  },
  "assignedTo": {
    "id": 1,
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "accountStatus": "ACTIVE",
    "userTypes": ["ADMIN"]
  },
  "ticketType": "B2B",
  "priority": "CRITICAL",
  "status": "OPEN",
  "title": "Server Down Issue",
  "description": "Production server is not responding",
  "createdAt": "2026-01-08T14:00:00",
  "updatedAt": "2026-01-08T14:00:00"
}
```

## Error Responses
All endpoints return error responses in the format:
```json
{
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `400 Bad Request` - Validation error or invalid operation
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
