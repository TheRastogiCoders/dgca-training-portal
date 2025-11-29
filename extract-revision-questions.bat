@echo off
echo ========================================
echo Revision Questions Extraction Script
echo ========================================
echo.

cd server

echo Installing dependencies (if needed)...
call npm install

echo.
echo Running revision questions extraction...
call npm run extract-revision

echo.
echo ========================================
echo Done! Check the output above for results.
echo ========================================
pause

