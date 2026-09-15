$content = Get-Content 'F:\Angular\app\app\questions.json' -Raw
$content = $content -replace 'images/', '/images/'
Set-Content -Path 'F:\Angular\app\app\questions.json' -Value $content -NoNewline
Write-Host "Updated"
