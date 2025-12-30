# PowerShell script to resize icons without ImageMagick
# Uses .NET System.Drawing classes

Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [int]$Width,
        [int]$Height
    )
    
    try {
        $image = [System.Drawing.Image]::FromFile($InputPath)
        $bitmap = New-Object System.Drawing.Bitmap($Width, $Height)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        
        # Set high quality rendering
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        # Draw resized image
        $graphics.DrawImage($image, 0, 0, $Width, $Height)
        
        # Save as PNG
        $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Cleanup
        $graphics.Dispose()
        $bitmap.Dispose()
        $image.Dispose()
        
        Write-Host "Created: $OutputPath ($Width x $Height)"
        return $true
    }
    catch {
        Write-Host "Error creating ${OutputPath}: $_" -ForegroundColor Red
        return $false
    }
}

# Main script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceIcon = Join-Path $scriptPath "icon-512x512.png"

if (-not (Test-Path $sourceIcon)) {
    Write-Host "Error: icon-512x512.png not found!" -ForegroundColor Red
    Write-Host "Please ensure icon-512x512.png exists in the icons folder."
    exit 1
}

Write-Host "Generating PWA icons from icon-512x512.png...`n"

$sizes = @(72, 96, 128, 144, 152, 192, 384)

foreach ($size in $sizes) {
    $outputPath = Join-Path $scriptPath "icon-${size}x${size}.png"
    Resize-Image -InputPath $sourceIcon -OutputPath $outputPath -Width $size -Height $size
}

Write-Host "`nIcon generation complete!`n"
Write-Host "Generated files:"
Get-ChildItem -Path $scriptPath -Filter "icon-*.png" | Sort-Object Name | Format-Table Name, @{Label="Size (KB)"; Expression={[math]::Round($_.Length/1KB, 2)}} -AutoSize
