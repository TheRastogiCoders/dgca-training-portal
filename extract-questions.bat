@echo off
echo ========================================
echo PDF Question Extraction Script
echo ========================================
echo.

cd server

echo Installing dependencies (if needed)...
call npm install

echo.
echo Running extraction and merge...
call npm run extract-and-merge

echo.
echo ========================================
echo Done! Check the output above for results.
echo ========================================
pause

