$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$logPath = Join-Path $projectPath "cleanup_log.txt"

$patterns = @(
    "*.zip", "*.jpg", "*.jpeg", "*.webp", "*.png", "*.mp3", "*.mp4", "*.tsbuildinfo", "*.map",
    "node_modules", "dist", "build", ".vscode", "__pycache__", ".bolt"
)

$filesToDelete = @()

foreach ($pattern in $patterns) {
    $matches = Get-ChildItem -Path $projectPath -Recurse -Force -Include $pattern -ErrorAction SilentlyContinue
    foreach ($match in $matches) {
        if (-not $match.PSIsContainer) {
            $filesToDelete += $match.FullName
        } elseif ($match.PSIsContainer) {
            $filesToDelete += $match.FullName
        }
    }
}

if ($filesToDelete.Count -eq 0) {
    Write-Host "No unnecessary files or folders found."
    exit
}

Write-Host "`nFound $($filesToDelete.Count) unnecessary files/folders:`n"
$filesToDelete | ForEach-Object { Write-Host $_ }

$answer = Read-Host "`nDo you want to delete these files? (y/n)"
if ($answer -eq 'y') {
    $log = @()
    foreach ($file in $filesToDelete) {
        try {
            if (Test-Path $file) {
                Remove-Item $file -Force -Recurse
                $log += "DELETED: $file"
            }
        } catch {
            $log += "FAILED TO DELETE: $file - $_"
        }
    }
    $log | Out-File -FilePath $logPath -Encoding UTF8
    Write-Host "`nCleanup complete. Log written to cleanup_log.txt"
} else {
    Write-Host "`nNo files were deleted. Review the list above."
}
