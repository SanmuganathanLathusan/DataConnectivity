# Activate the virtual environment and start the uvicorn server
Write-Host "Starting Backend..." -ForegroundColor Green
$venvPath = ".\venv\Scripts\Activate.ps1"
if (Test-Path $venvPath) {
    & $venvPath
    uvicorn app.main:app --reload
} else {
    Write-Error "Virtual environment not found! Please run 'python -m venv venv' and install requirements."
}
