# NetChi Backend - ASP.NET Core 10.0 - Production Ready
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 as builder

WORKDIR /src

# Copy solution and project files from backend directory
COPY NetChi.Api.slnx .
COPY global.json .

# Copy all source projects
COPY src/NetChi.Api/ ./src/NetChi.Api/
COPY src/NetChi.Application/ ./src/NetChi.Application/
COPY src/NetChi.Infrastructure/ ./src/NetChi.Infrastructure/
COPY src/NetChi.Domain/ ./src/NetChi.Domain/
COPY src/NetChi.Shared/ ./src/NetChi.Shared/

# Restore & Build
RUN dotnet restore "NetChi.Api.slnx"
RUN dotnet build "NetChi.Api.slnx" -c Release -o /app/build

# Stage 2: Publish
FROM builder as publish
RUN dotnet publish "NetChi.Api.slnx" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

# Copy published app
COPY --from=publish /app/publish .

# Expose port
EXPOSE 5232

# Set environment for production
ENV ASPNETCORE_URLS=http://+:5232
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5232/health || exit 1

# Run application
ENTRYPOINT ["dotnet", "NetChi.Api.dll"]
