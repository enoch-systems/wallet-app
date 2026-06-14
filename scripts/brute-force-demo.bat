@echo off
echo ============================================
echo   BRUTE FORCE DEMO - WALLET LOGIN ATTACK
echo ============================================
echo.
echo This shows how rate limiting blocks attacks
echo after 5 failed login attempts.
echo.
echo Target: https://wallet-app-xqtq.onrender.com/auth/login
echo.
echo Press ENTER to start the attack demo...
pause >nul
echo.
echo ATTACK STARTED - Sending 20 login attempts...
echo ============================================
echo.

for /l %%i in (1,1,20) do (
    for /f "tokens=2 delims=:" %%a in ('curl -s -o nul -w "%%{http_code}" -X POST https://wallet-app-xqtq.onrender.com/auth/login -H "Content-Type: application/json" -d "{\"phone\":\"8132641246\",\"password\":\"WrongPass123\"}" 2^>nul') do set "code=%%a"
    if %%i lss 10 (set "attempt=0%%i") else (set "attempt=%%i")
    if "!code!"=="429" (
        echo Attempt !attempt!/20 - BLOCKED ^(HTTP 429 - RATE LIMIT EXCEEDED^)
        echo.
        echo ============================================
        echo   RATE LIMITER STOPPED THE ATTACK!
        echo   ^> Only !attempt! requests were sent before
        echo   ^> the server started returning 429 errors.
        echo   ^> Rate limiting is working correctly.
        echo ============================================
        pause
        exit /b
    ) else (
        echo Attempt !attempt!/20 - Status: !code! ^(PROCESSED - NO LIMIT YET^)
    )
)

echo.
echo All 20 attempts went through. Rate limit not triggered.
pause