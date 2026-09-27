Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile((Join-Path (Get-Location) 'References\ICON REFERENCES.jpg'))
Write-Output "Dimensions: $($img.Width)x$($img.Height)"
$img.Dispose()
