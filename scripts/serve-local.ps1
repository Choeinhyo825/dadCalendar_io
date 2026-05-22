Set-Location $PSScriptRoot\..

$preferredPort = 8080
if ($args.Count -gt 0) { $preferredPort = [int]$args[0] }

function Test-PortAvailable([int]$port) {
  $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
  try {
    $listener.Start()
    $listener.Stop()
    return $true
  } catch {
    return $false
  }
}

$port = $null
foreach ($candidate in ($preferredPort..($preferredPort + 30))) {
  if (Test-PortAvailable $candidate) {
    $port = $candidate
    break
  }
}

if (-not $port) {
  Write-Error "Ports $preferredPort-$($preferredPort + 30) are all in use. Try: .\scripts\serve-local.ps1 9000"
  exit 1
}

if ($port -ne $preferredPort) {
  Write-Host "Port $preferredPort is busy. Starting on $port instead."
}

Write-Host "dadCalendar local server: http://localhost:$port"
Write-Host "Stop: Ctrl+C"
Write-Host ""

$python = Get-Command python -ErrorAction SilentlyContinue
if ($python) {
  & python -m http.server $port
  exit $LASTEXITCODE
}

$py = Get-Command py -ErrorAction SilentlyContinue
if ($py) {
  & py -m http.server $port
  exit $LASTEXITCODE
}

Write-Error "Python is required. Install Python or run: python -m http.server $port"
exit 1
