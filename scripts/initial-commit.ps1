Set-Location $PSScriptRoot\..
$git = (Get-Command git -ErrorAction Stop).Source
$tree = & $git write-tree
if (-not $tree) { exit 1 }
$commit = & $git commit-tree $tree -m "Add GitHub Pages web calendar"
if (-not $commit) { exit 1 }
& $git update-ref refs/heads/main $commit
& $git log --oneline -1
