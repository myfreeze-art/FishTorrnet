param(
  [Parameter(Mandatory = $true)][string]$Version
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$out = Join-Path $root "target\msix"
$layout = Join-Path $out "layout"

if (Test-Path $out) { Remove-Item -Recurse -Force $out }
New-Item -ItemType Directory -Force (Join-Path $layout "Assets") | Out-Null

Copy-Item (Join-Path $root "target\release\fishtorrnet.exe") (Join-Path $layout "FishTorrnet.exe")
$icons = Join-Path $root "src-tauri\icons"
foreach ($name in "StoreLogo.png", "Square44x44Logo.png", "Square150x150Logo.png", "Square310x310Logo.png") {
  Copy-Item (Join-Path $icons $name) (Join-Path $layout "Assets\$name")
}

$identity = if ($env:MSIX_IDENTITY_NAME) { $env:MSIX_IDENTITY_NAME } else { "FishTorrnet" }
$publisher = if ($env:MSIX_PUBLISHER) { $env:MSIX_PUBLISHER } else { "CN=FishTorrnet" }
$display = if ($env:MSIX_PUBLISHER_DISPLAY_NAME) { $env:MSIX_PUBLISHER_DISPLAY_NAME } else { "FishTorrnet" }
$numeric = ($Version -replace '^v', '') -replace '-.*$', ''

$manifest = Get-Content (Join-Path $PSScriptRoot "AppxManifest.xml") -Raw
$manifest = $manifest.Replace("{{NAME}}", $identity).Replace("{{PUBLISHER}}", $publisher)
$manifest = $manifest.Replace("{{PUBLISHER_DISPLAY_NAME}}", $display).Replace("{{VERSION}}", "$numeric.0")
[System.IO.File]::WriteAllText((Join-Path $layout "AppxManifest.xml"), $manifest)

$makeappx = Get-ChildItem "${env:ProgramFiles(x86)}\Windows Kits\10\bin\*\x64\makeappx.exe" |
  Sort-Object FullName -Descending | Select-Object -First 1
if (-not $makeappx) { throw "makeappx.exe not found, install the Windows SDK" }

$package = Join-Path $out "FishTorrnet_${numeric}_x64.msix"
& $makeappx.FullName pack /d $layout /p $package /o | Out-Host
if ($LASTEXITCODE -ne 0) { throw "makeappx failed" }
Write-Output $package
