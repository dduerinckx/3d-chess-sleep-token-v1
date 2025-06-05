# Get current working directory
$root = Get-Location
$logPath = Join-Path $root "cleanup_log.txt"

# Start log
"===== Cleanup Log - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') =====`n" | Out-File -FilePath $logPath

# File extensions to flag
$extensions = @(".zip", ".rar", ".7z", ".log", ".mp3", ".jpg", ".jpeg", ".png", ".webp", ".gif", ".map", ".tsbuildinfo")

# Folder names to flag
$junkFolders = @(".vscode", "node_modules", "dist", "build", ".bolt", "__pycache__")

# Collect results
$unneeded = @()

# Scan for junk files
$extensions | ForEach-Object {
    $ext = $_
    $files = Get-ChildItem -Recurse -File -Filter "*$ext" -ErrorAction SilentlyContinue
    $unneeded += $files
}

# Scan for junk folders
$junkFolders | ForEach-Object {
    $folder = $_
    $dirs = Get-ChildItem -Recurse -Directory -Filter $folder -ErrorAction SilentlyContinue
    $unneeded += $dirs
}

# Output results
if ($unneeded.Count -gt 0) {
    Write-Host "`n⚠️ Unnecessary files/folders found:`n" -ForegroundColor Yellow
    $unneeded | ForEach-Object {
        Write-Host $_.FullName
        "FOUND: $($_.FullName)" | Out-File -Append -FilePath $logPath
    }

    # Ask before deletion
    $confirm = Read-Host "`nDo you want to DELETE these files/folders? (y/N)"
    if ($confirm -eq "y") {
        $unneeded | ForEach-Object {
            try {
                if ($_.PSIsContainer) {
                    Remove-Item $_.FullName -Recurse -Force
                    "DELETED DIR: $($_.FullName)" | Out-File -Append -FilePath $logPath
                } else {
                    Remove-Item $_.FullName -Force
                    "DELETED FILE: $($_.FullName)" | Out-File -Append -FilePath $logPath
                }
            } catch {
                "FAILED TO DELETE: $($_.FullName) -- $_" | Out-File -Append -FilePath $logPath
            }
        }
        Write-Host "`n🧼 Cleanup complete. Log saved to cleanup_log.txt" -ForegroundColor Green
    } else {
        Write-Host "`n🚫 No files deleted. Log saved to cleanup_log.txt" -ForegroundColor Cyan
    }
} else {
    "No unnecessary files or folders found." | Out-File -Append -FilePath $logPath
    Write-Host "`n✅ No unnecessary files found. Log saved to cleanup_log.txt" -ForegroundColor Green
}
