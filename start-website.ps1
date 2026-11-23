# SmartNTech - run the website on this computer (any Windows PC, nothing to install).
# Started by START-WEBSITE.bat. Serves this folder at http://localhost:8780 and opens it in the browser.
param([int]$Port = 8780, [switch]$NoBrowser)
$Root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
try { $listener.Start() } catch {
  Write-Host "Port $Port is busy. The website may already be running: http://localhost:$Port/" -ForegroundColor Yellow
  Start-Process "http://localhost:$Port/"
  exit
}
$types = @{ '.html' = 'text/html; charset=utf-8'; '.js' = 'application/javascript; charset=utf-8'; '.css' = 'text/css; charset=utf-8';
  '.svg' = 'image/svg+xml'; '.xml' = 'application/xml'; '.txt' = 'text/plain; charset=utf-8'; '.md' = 'text/plain; charset=utf-8';
  '.json' = 'application/json'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.ico' = 'image/x-icon'; '.webp' = 'image/webp' }
Write-Host ""
Write-Host "  SmartNTech is running at  http://localhost:$Port/" -ForegroundColor Cyan
Write-Host "  Admin login: scroll to the footer and click 'Admin'." -ForegroundColor Cyan
Write-Host "  Keep this window open. Close it to stop the website." -ForegroundColor DarkGray
Write-Host ""
if (-not $NoBrowser) { Start-Process "http://localhost:$Port/" }
$rootFull = [IO.Path]::GetFullPath($Root)
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  try {
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ($path -eq '' -or $path.EndsWith('/')) { $path += 'index.html' }
    $full = [IO.Path]::GetFullPath((Join-Path $Root $path))
    if ($full.StartsWith($rootFull) -and (Test-Path -LiteralPath $full -PathType Leaf)) {
      $bytes = [IO.File]::ReadAllBytes($full)
      $ext = [IO.Path]::GetExtension($full).ToLower()
      $ctx.Response.ContentType = $(if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' })
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else { $ctx.Response.StatusCode = 404 }
  } catch { $ctx.Response.StatusCode = 500 }
  $ctx.Response.Close()
}
