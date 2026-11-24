<#
  SmartNTech page builder.
  Generates blog/<article>.html for every article, blog/index.html, blog/manifest.js,
  sitemap.xml and robots.txt. Run it again whenever you add or edit articles in /articles.

  Usage (from PowerShell, in this folder):
    powershell -ExecutionPolicy Bypass -File .\build.ps1

  It starts a temporary local server on http://localhost:8765, opens the builder page in
  your browser, saves the files the page sends back, and stops when the build finishes.
  No Node.js or other installs needed.
#>
param(
  [int]$Port = 8765,
  [switch]$NoBrowser,          # don't open a browser (useful for automation)
  [string]$Token = ''          # optional fixed token (default: random)
)

$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath($PSScriptRoot)
if (-not $Token) { $Token = [guid]::NewGuid().ToString('N') }

# Only these generated paths may be written by the builder page.
$allowed = '^(blog/[a-z0-9-]+\.html|blog/manifest\.js|sitemap\.xml|robots\.txt|assets/tailwind\.css|(image-compressor|pdf-compressor|color-picker|resume-builder|typing-test)/index\.html)$'
$types = @{ '.html' = 'text/html; charset=utf-8'; '.js' = 'application/javascript; charset=utf-8'; '.css' = 'text/css'; '.xml' = 'application/xml'; '.txt' = 'text/plain; charset=utf-8'; '.svg' = 'image/svg+xml' }
$utf8 = New-Object Text.UTF8Encoding($false)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
$url = "http://localhost:$Port/tools/build-pages.html?token=$Token"
Write-Host "SmartNTech builder running at $url"
if (-not $NoBrowser) { Start-Process $url }

$written = 0; $done = $false
try {
  while (-not $done) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request; $res = $ctx.Response
    try {
      $path = [Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/'))
      if ($req.HttpMethod -eq 'POST') {
        if ($req.QueryString['token'] -ne $Token) { $res.StatusCode = 403; continue }
        $reader = New-Object IO.StreamReader($req.InputStream, [Text.Encoding]::UTF8)
        $body = $reader.ReadToEnd(); $reader.Close()

        if ($path -eq '__write') {
          $target = $req.QueryString['path']
          if ($target -notmatch $allowed) { $res.StatusCode = 400; continue }
          $full = [IO.Path]::GetFullPath((Join-Path $root $target))
          if (-not $full.StartsWith($root)) { $res.StatusCode = 400; continue }
          New-Item -ItemType Directory -Force (Split-Path $full) | Out-Null
          [IO.File]::WriteAllText($full, $body, $utf8)
          $written++
        }
        elseif ($path -eq '__done') {
          # Remove blog pages that were not generated this time (e.g. an article was renamed or deleted).
          $keep = @{}; $body -split "`n" | ForEach-Object { $keep[$_.Trim()] = $true }
          Get-ChildItem (Join-Path $root 'blog') -Filter '*.html' -ErrorAction SilentlyContinue | ForEach-Object {
            if (-not $keep.ContainsKey('blog/' + $_.Name)) { Remove-Item $_.FullName; Write-Host "Removed stale page blog/$($_.Name)" }
          }
          $done = $true
        }
        else { $res.StatusCode = 404 }
      }
      else {
        # Serve site files so the builder page can load articles and helpers.
        if ($path -eq '') { $path = 'index.html' }
        $full = [IO.Path]::GetFullPath((Join-Path $root $path))
        if ($full.StartsWith($root) -and (Test-Path $full -PathType Leaf)) {
          $bytes = [IO.File]::ReadAllBytes($full)
          $ext = [IO.Path]::GetExtension($full).ToLower()
          $res.ContentType = $(if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' })
          $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else { $res.StatusCode = 404 }
      }
    }
    finally { $res.Close() }
  }
}
finally { $listener.Stop() }

Write-Host "Build complete: $written files written."
Write-Host "Remember: set your real domain in site.config.js before publishing, then run build.ps1 again."
