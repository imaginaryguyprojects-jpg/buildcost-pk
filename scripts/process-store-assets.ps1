Add-Type -AssemblyName System.Drawing

$iconSrc = "C:\Users\umers\.gemini\antigravity\brain\2c2f330a-8e2e-45e2-850a-b533bebdb36f\play_store_icon_1789384752598.jpg"
$featureSrc = "C:\Users\umers\.gemini\antigravity\brain\2c2f330a-8e2e-45e2-850a-b533bebdb36f\play_store_feature_graphic_1789384773559.jpg"

$targetDirs = @(
    "apps\web\public\store-assets",
    "public\store-assets",
    "store-assets"
)

foreach ($dir in $targetDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
}

# 1. Process App Icon: 512 x 512 px, 32-bit color, no transparency
Write-Host "Processing App Icon (512x512)..."
$imgIcon = [System.Drawing.Image]::FromFile($iconSrc)

# Crop slightly inwards to eliminate any squircle borders and fill full-bleed 512x512
$cropMarginPct = 0.12 # crop 12% from each edge to zoom in on the 3D building/calculator artwork
$cropX = [int]($imgIcon.Width * $cropMarginPct)
$cropY = [int]($imgIcon.Height * $cropMarginPct)
$cropW = [int]($imgIcon.Width * (1.0 - 2 * $cropMarginPct))
$cropH = [int]($imgIcon.Height * (1.0 - 2 * $cropMarginPct))
$srcRect = New-Object System.Drawing.Rectangle $cropX, $cropY, $cropW, $cropH

$bmpIcon = New-Object System.Drawing.Bitmap 512, 512, ([System.Drawing.Imaging.PixelFormat]::Format32bppRgb)
$gIcon = [System.Drawing.Graphics]::FromImage($bmpIcon)
$gIcon.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gIcon.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gIcon.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gIcon.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

# Solid background fill to guarantee zero alpha
$bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 4, 120, 87)) # #047857 emerald
$gIcon.FillRectangle($bgBrush, 0, 0, 512, 512)

$destRect = New-Object System.Drawing.Rectangle 0, 0, 512, 512
$gIcon.DrawImage($imgIcon, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$gIcon.Dispose()
$imgIcon.Dispose()

foreach ($dir in $targetDirs) {
    $outIconPng = Join-Path $dir "icon-512x512.png"
    $bmpIcon.Save($outIconPng, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "Saved: $outIconPng"
}
$bmpIcon.Dispose()


# 2. Process Feature Graphic: 1024 x 500 px
Write-Host "`nProcessing Feature Graphic (1024x500)..."
$imgFeature = [System.Drawing.Image]::FromFile($featureSrc)

$bmpFeature = New-Object System.Drawing.Bitmap 1024, 500, ([System.Drawing.Imaging.PixelFormat]::Format32bppRgb)
$gFeature = [System.Drawing.Graphics]::FromImage($bmpFeature)
$gFeature.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gFeature.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gFeature.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gFeature.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

# Source aspect is 16:9 (1024x576 approx). Target is 1024x500 (approx 2.048:1).
# We fit width 1024, and center-crop vertically:
$targetAspect = 1024.0 / 500.0
$srcAspect = [double]$imgFeature.Width / [double]$imgFeature.Height

if ($srcAspect -lt $targetAspect) {
    # Source is taller: crop top/bottom
    $srcW = $imgFeature.Width
    $srcH = [int]($imgFeature.Width / $targetAspect)
    $srcX = 0
    $srcY = [int](($imgFeature.Height - $srcH) / 2)
} else {
    # Source is wider: crop left/right
    $srcH = $imgFeature.Height
    $srcW = [int]($imgFeature.Height * $targetAspect)
    $srcX = [int](($imgFeature.Width - $srcW) / 2)
    $srcY = 0
}

$srcRectFeat = New-Object System.Drawing.Rectangle $srcX, $srcY, $srcW, $srcH
$destRectFeat = New-Object System.Drawing.Rectangle 0, 0, 1024, 500
$gFeature.DrawImage($imgFeature, $destRectFeat, $srcRectFeat, [System.Drawing.GraphicsUnit]::Pixel)

$gFeature.Dispose()
$imgFeature.Dispose()

foreach ($dir in $targetDirs) {
    $outFeatPng = Join-Path $dir "feature-graphic-1024x500.png"
    $outFeatJpg = Join-Path $dir "feature-graphic-1024x500.jpg"
    $bmpFeature.Save($outFeatPng, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmpFeature.Save($outFeatJpg, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    Write-Host "Saved: $outFeatPng and .jpg"
}
$bmpFeature.Dispose()

Write-Host "`nAll Google Play Store assets processed successfully!"
