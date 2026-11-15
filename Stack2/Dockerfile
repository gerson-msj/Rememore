FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/Rememore.Api/Rememore.Api.csproj src/Rememore.Api/
RUN dotnet restore src/Rememore.Api/Rememore.Api.csproj

COPY src/Rememore.Api/ src/Rememore.Api/
WORKDIR /src/src/Rememore.Api
RUN dotnet publish Rememore.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 10000
CMD ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:${PORT:-10000} dotnet Rememore.Api.dll"]
