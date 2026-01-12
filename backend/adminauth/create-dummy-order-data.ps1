# PowerShell script to create dummy order data for B2C user

$baseUrl = "http://localhost:9090"
$userId = 5

Write-Host "Creating prescription for user ID: $userId" -ForegroundColor Green

# Create Prescription
$prescriptionBody = @{
    userId = 5
    doctorName = "Dr. Rajesh Kumar"
    prescriptionDate = "2026-01-08"
    validUntil = "2026-02-08"
    fileUrl = "https://example.com/prescriptions/prescription-niraj-2026-01-08.pdf"
    status = "UPLOADED"
} | ConvertTo-Json

try {
    $prescriptionResponse = Invoke-RestMethod -Uri "$baseUrl/api/prescriptions" `
        -Method POST `
        -ContentType "application/json" `
        -Body $prescriptionBody
    
    $prescriptionId = $prescriptionResponse.id
    Write-Host "Prescription created successfully! ID: $prescriptionId" -ForegroundColor Green
    Write-Host "Prescription Details:" -ForegroundColor Cyan
    $prescriptionResponse | ConvertTo-Json -Depth 5
    
    Start-Sleep -Seconds 1
    
    Write-Host "`nCreating order with medicine items..." -ForegroundColor Green
    
    # Create Order with Order Items
    $orderBody = @{
        userId = $userId
        orderType = "B2C"
        orderNumber = "ORD-B2C-2026-001"
        subtotalAmt = 1250.00
        totalAmt = 1475.00
        status = "PENDING"
        prescriptionRequired = $true
        prescriptionId = $prescriptionId
        orderItems = @(
            @{
                productId = 1001
                quantity = 2
                unitPrice = 250.00
                prescriptionRequired = $true
            },
            @{
                productId = 1002
                quantity = 1
                unitPrice = 450.00
                prescriptionRequired = $true
            },
            @{
                productId = 1003
                quantity = 3
                unitPrice = 100.00
                prescriptionRequired = $false
            }
        )
    } | ConvertTo-Json -Depth 5
    
    $orderResponse = Invoke-RestMethod -Uri "$baseUrl/api/orders" `
        -Method POST `
        -ContentType "application/json" `
        -Body $orderBody
    
    $orderId = $orderResponse.id
    Write-Host "`nOrder created successfully! ID: $orderId" -ForegroundColor Green
    Write-Host "Order Details:" -ForegroundColor Cyan
    $orderResponse | ConvertTo-Json -Depth 5
    
    Write-Host "`n========================================" -ForegroundColor Yellow
    Write-Host "Dummy Data Created Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "Prescription ID: $prescriptionId" -ForegroundColor Cyan
    Write-Host "Order ID: $orderId" -ForegroundColor Cyan
    Write-Host "User ID: $userId (niraj@gmail.com)" -ForegroundColor Cyan
    Write-Host "`nOrder Items:" -ForegroundColor Yellow
    Write-Host "  - Medicine 1 (Product ID: 1001): 2 units @ ₹250.00 each (Prescription Required)" -ForegroundColor White
    Write-Host "  - Medicine 2 (Product ID: 1002): 1 unit @ ₹450.00 each (Prescription Required)" -ForegroundColor White
    Write-Host "  - Medicine 3 (Product ID: 1003): 3 units @ ₹100.00 each (No Prescription)" -ForegroundColor White
    Write-Host "`nTotal Amount: ₹1,475.00" -ForegroundColor Green
    
} catch {
    Write-Host "Error occurred: $_" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
