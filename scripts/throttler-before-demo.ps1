Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  BRUTE FORCE DEMO - NO RATE LIMIT" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Sending 20 login attempts rapidly..."
Write-Host "All 20 should return 401 (processed)"
Write-Host ""

for ($i=1; $i -le 20; $i++) {
    $status = curl.exe -s -o nul -w "%{http_code}" -X POST https://wallet-app-xqtq.onrender.com/auth/login -H "Content-Type: application/json" -d "{`"email`":`"test@test.com`",`"password`":`"WrongPass123!`"}"
    if ($i -lt 10) {
        Write-Host "Attempt 0$i/20 - Status: $status (PROCESSED - no limit)"
    } else {
        Write-Host "Attempt $i/20 - Status: $status (PROCESSED - no limit)"
    }
    Start-Sleep -Milliseconds 300
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  ALL 20 ATTEMPTS WERE PROCESSED" -ForegroundColor Green
Write-Host "  No rate limiting is active." -ForegroundColor Green
Write-Host "  After Throttler install, only 5 will go through." -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Green
Read-Host "Press ENTER to exit"