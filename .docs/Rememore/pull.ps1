$origem = 'G:\Meu Drive\Projetos\Rememore'
$destino = (Get-Location).Path

Get-ChildItem -LiteralPath $origem -Filter *.md -File -Recurse |
    Where-Object { $_.FullName -notmatch '[\\/]inventário([\\/]|$)' } |
    ForEach-Object {
        $caminhoRelativo = [System.IO.Path]::GetRelativePath($origem, $_.FullName)
        $caminhoDestino = Join-Path $destino $caminhoRelativo
        $pastaDestino = Split-Path -Parent $caminhoDestino

        New-Item -ItemType Directory -Path $pastaDestino -Force | Out-Null
        Copy-Item -LiteralPath $_.FullName -Destination $caminhoDestino -Force
    }
