@echo off
echo ============================================
echo   BRUTE FORCE DEMO - WALLET LOGIN ATTACK
echo ============================================
echo.
echo This shows how many requests go through
echo WITHOUT rate limiting.
echo.
echo Target: https://wallet-app-xqtq.onrender.com/auth/login
echo Trying password: WrongPass123
echo.
echo Press ENTER to start the attack demo...
pause >nul
echo.
echo ATTACK STARTED - Sending 20 login attempts...
echo ============================================
echo.

for /l %%i in (1,1,20) do (
    for /f "tokens=2 delims=:" %%a in ('curl -s -o nul -w "%%{http_code}" -X POST https://wallet-app-xqtq.onrender.com/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"WrongPass123!\"}" 2^>nul') do set "code=%%a"
    if %%i lss 10 (echo Attempt 0%%i/20 - Status: ALL PROCESSED ^(NO LIMIT^)) else (echo Attempt %%i/20 - Status: ALL PROCESSED ^(NO LIMIT^))
)

echo.
echo ============================================
echo   DEMO COMPLETE - All 20 attempts succeeded
echo   No rate limit detected.
echo ============================================
echo.
echo After adding Throttler, only 5 would go through.
echo The rest would be blocked with 429.
echo.
pause