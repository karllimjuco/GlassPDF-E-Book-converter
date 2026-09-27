Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path (Get-Location) 'References\ICON REFERENCES.jpg'
$outDir = Join-Path (Get-Location) 'public\assets\icons'
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$names = @('pdf', 'folder', 'search', 'printer')
$iconWidth = 444
$iconHeight = 592

for ($i = 0; $i -lt 4; $i++) {
    $rect = New-Object System.Drawing.Rectangle ($i * $iconWidth), 0, $iconWidth, $iconHeight
    $crop = $src.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    # Make nearly white background pixels transparent so it blends onto any glass background
    for ($x = 0; $x -lt $crop.Width; $x++) {
        for ($y = 0; $y -lt $crop.Height; $y++) {
            $pixel = $crop.GetPixel($x, $y)
            # If R, G, B are all >= 248, treat as white background
            if ($pixel.R -ge 248 -and $pixel.G -ge 248 -and $pixel.B -ge 248) {
                $crop.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
            } elseif ($pixel.R -ge 235 -and $pixel.G -ge 235 -and $pixel.B -ge 235) {
                # Feather edge
                $alpha = [int](255 * (255 - (($pixel.R + $pixel.G + $pixel.B) / 3)) / 20)
                if ($alpha -lt 0) { $alpha = 0 }
                if ($alpha -gt 255) { $alpha = 255 }
                $crop.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $pixel.R, $pixel.G, $pixel.B))
            }
        }
    }
    
    $outPath = Join-Path $outDir "$($names[$i]).png"
    $crop.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $crop.Dispose()
    Write-Output "Saved $outPath"
}

$src.Dispose()
Write-Output "Done cropping icons"
