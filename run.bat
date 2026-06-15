@echo off
echo Starting Restaurant Table Reservation System...
echo ==============================================

:: Check if backend/venv/Scripts/python.exe exists
if not exist "backend\venv\Scripts\python.exe" (
    echo Error: Backend virtual environment not found in backend\venv!
    echo Please set up backend environment first.
    pause
    exit /b 1
)

:: Check if frontend/node_modules exists
if not exist "frontend\node_modules" (
    echo Frontend dependencies not found in frontend\node_modules.
    echo Running npm install in frontend...
    cd frontend
    call npm install
    cd ..
)

echo Starting Flask Backend on http://localhost:5000 ...
start "Backend - Flask Server" cmd /k "cd backend && venv\Scripts\python.exe app.py"

echo Starting Vite Frontend on http://localhost:3000 ...
start "Frontend - Vite Dev Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers have been launched in separate windows.
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:3000
echo.
echo Press any key to exit this launcher window...
pause > nul
