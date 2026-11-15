# Dados de acesso a base de dados

## Database URL
libsql://rememore-gerson-msj.aws-us-east-1.turso.io

## Token Read Write
eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTE3NzY4MTIsImlkIjoiMDFhMTJlMzctNDMwMS03MjUyLThiMGYtYmNkMWFhOGQzZTczIiwia2lkIjoibE84aFlPeXFYTnN4QUJ3SmRwbHRINGMwSV90Mjh5cXgwZmlVYTN2NTFZdyIsInJpZCI6ImUwMTQ0ODhmLWQ2YTQtNGRlNy1hZTM4LWFmMmRlYTQ5MWZkZiJ9.OA8VbamcNenBrl5lxzvLKQ76JKzPe9OdK2MbAx1dkt8wRYqPSiFUAxpJqQlyBCOGFSZ30xSE7FQVU60Lz39CAw

## Local

$tursoUrl = Read-Host "URL do banco Turso"
$secureToken = Read-Host "Auth token do Turso" -AsSecureString
$token = [System.Net.NetworkCredential]::new("", $secureToken).Password

$env:ConnectionStrings__Rememore = "Data Source=$tursoUrl;Auth Token=$token"
dotnet run --project src/Rememore.Api

Remove-Item Env:ConnectionStrings__Rememore
Remove-Variable token, secureToken, tursoUrl

## Render

Data Source=libsql://rememore-gerson-msj.aws-us-east-1.turso.io;Auth Token=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTE3NzY4MTIsImlkIjoiMDFhMTJlMzctNDMwMS03MjUyLThiMGYtYmNkMWFhOGQzZTczIiwia2lkIjoibE84aFlPeXFYTnN4QUJ3SmRwbHRINGMwSV90Mjh5cXgwZmlVYTN2NTFZdyIsInJpZCI6ImUwMTQ0ODhmLWQ2YTQtNGRlNy1hZTM4LWFmMmRlYTQ5MWZkZiJ9.OA8VbamcNenBrl5lxzvLKQ76JKzPe9OdK2MbAx1dkt8wRYqPSiFUAxpJqQlyBCOGFSZ30xSE7FQVU60Lz39CAw