# Cursor 터미널에서 git commit --trailer 오류 시 사용
param(
    [string]$Message = "Enable GitHub Pages deploy"
)
Set-Location $PSScriptRoot\..
$git = (Get-Command git -ErrorAction Stop).Source

& $git add -A
$tree = & $git write-tree
if (-not $tree) { exit 1 }
$parent = ""
try { $parent = (& $git rev-parse HEAD 2>$null) } catch {}
if ($parent) {
    $commit = & $git commit-tree $tree -p $parent -m $Message
} else {
    $commit = & $git commit-tree $tree -m $Message
}
if (-not $commit) { exit 1 }
& $git update-ref refs/heads/main $commit
Write-Host "Committed: $(& $git log --oneline -1)"
Write-Host "Push: git push origin main"
