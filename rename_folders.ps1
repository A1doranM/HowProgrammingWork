# Script to rename folders in "GOF Patterns JS" directory
# Removes -master and -main suffixes

$basePath = "GOF Patterns JS"

Get-ChildItem -Path $basePath -Directory | Where-Object { $_.Name -match '-master$|-main$' } | ForEach-Object {
    $oldName = $_.Name
    $newName = $_.Name -replace '-master$|-main$', ''
    Write-Host "Renaming: $oldName -> $newName"
    Rename-Item -Path $_.FullName -NewName $newName
}

Write-Host "`nRenaming completed!"