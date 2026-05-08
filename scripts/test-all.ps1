$ErrorActionPreference = "Stop"

function Import-EnvFile([string]$Path) {
  if (-not (Test-Path $Path)) { return }
  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if ($line.Length -eq 0) { return }
    if ($line.StartsWith("#")) { return }
    $idx = $line.IndexOf("=")
    if ($idx -lt 1) { return }
    $k = $line.Substring(0, $idx).Trim()
    $v = $line.Substring($idx + 1).Trim()
    if ($v.StartsWith('"') -and $v.EndsWith('"') -and $v.Length -ge 2) {
      $v = $v.Substring(1, $v.Length - 2)
    }
    if ($v.StartsWith("'") -and $v.EndsWith("'") -and $v.Length -ge 2) {
      $v = $v.Substring(1, $v.Length - 2)
    }
    [System.Environment]::SetEnvironmentVariable($k, $v, "Process")
  }
}

function Wait-HttpOk([string]$Url, [int]$TimeoutSec = 60) {
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  while ($sw.Elapsed.TotalSeconds -lt $TimeoutSec) {
    try {
      $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
      if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 400) { return }
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }
  throw "Timeout waiting for $Url"
}

Write-Host "== Load e2e env file =="
Import-EnvFile (Join-Path $PSScriptRoot "..\frontend\.env.e2e.local")

Write-Host "== Backend: pytest =="
Push-Location "$PSScriptRoot\..\backend"
try {
  .\.venv\Scripts\python -m pytest
} finally {
  Pop-Location
}

Write-Host "== Backend: start uvicorn =="
Push-Location "$PSScriptRoot\..\backend"
$backend = Start-Process -FilePath ".\.venv\Scripts\python" -ArgumentList @("-m","uvicorn","app.main:app","--host","127.0.0.1","--port","8000") -PassThru -WindowStyle Hidden
Pop-Location

try {
  Wait-HttpOk "http://127.0.0.1:8000/"

  Write-Host "== Frontend: Playwright (smoke) =="
  Push-Location "$PSScriptRoot\..\frontend"
  try {
    npx playwright install chromium
    npm run test:e2e
  } finally {
    Pop-Location
  }
} finally {
  if ($backend -and -not $backend.HasExited) {
    Stop-Process -Id $backend.Id -Force
  }
}

